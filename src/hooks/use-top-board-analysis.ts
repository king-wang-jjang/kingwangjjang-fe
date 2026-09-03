import type { BoardPost, BoardAnalysisJobStatus } from 'src/api/board-api';

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState, useEffect, useCallback } from 'react';

import { useAuthStore } from 'src/store/auth-store';
import { reanalyzeBoardPost, getBoardAnalysisJob } from 'src/api/board-api';

import { isAdmin } from 'src/auth/permissions';

import { TOP_BOARDS_TODAY, TOP_BOARDS_QUERY_KEY } from './use-top-boards';

const analysisPollIntervalMs = 1500;
const analysisPollLimit = 80;

type AnalysisJobs = Record<string, BoardAnalysisJobStatus>;
type AnalysisErrors = Record<string, string>;

export function useTopBoardAnalysis(selectedDate: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdminUser = isAdmin(user);
  const requestsRef = useRef(new Set<string>());
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJobs>({});
  const [analysisErrors, setAnalysisErrors] = useState<AnalysisErrors>({});

  useEffect(() => {
    setAnalysisErrors({});
  }, [selectedDate]);

  const updateCachedSummary = useCallback(
    (job: BoardAnalysisJobStatus) => {
      if (!job.summary) {
        return;
      }

      queryClient.setQueryData<BoardPost[]>(
        [...TOP_BOARDS_QUERY_KEY, selectedDate],
        (currentPosts) =>
          currentPosts?.map((post) =>
            post.Id === job.boardId
              ? {
                  ...post,
                  gptAnswer: job.summary,
                  tags: job.tags ?? post.tags,
                  llmEngagementScore: job.llmEngagementScore ?? post.llmEngagementScore,
                  llmEngagementReason: job.llmEngagementReason ?? post.llmEngagementReason,
                  analysisStatus: 'done',
                }
              : post
          )
      );
    },
    [queryClient, selectedDate]
  );

  const requestReanalysis = useCallback(
    async (post: BoardPost) => {
      const boardId = post.Id;
      if (
        selectedDate !== TOP_BOARDS_TODAY ||
        !isAdminUser ||
        !boardId ||
        requestsRef.current.has(boardId)
      ) {
        return;
      }

      requestsRef.current.add(boardId);
      setAnalysisErrors((current) => {
        const next = { ...current };
        delete next[boardId];
        return next;
      });
      setAnalysisJobs((current) => ({
        ...current,
        [boardId]: createPendingAnalysisJob(boardId),
      }));

      try {
        const initialJob = await reanalyzeBoardPost(boardId);
        setAnalysisJobs((current) => ({ ...current, [boardId]: initialJob }));
        const finishedJob = isActiveAnalysisJob(initialJob)
          ? await pollBoardAnalysisJob(initialJob.jobId, (latestJob) => {
              setAnalysisJobs((current) => ({ ...current, [boardId]: latestJob }));
            })
          : initialJob;

        if (finishedJob.status !== 'completed' || !finishedJob.summary) {
          throw new Error(finishedJob.error || finishedJob.message || '요약 결과가 없습니다.');
        }

        updateCachedSummary(finishedJob);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        setAnalysisErrors((current) => ({
          ...current,
          [boardId]: message || '요약을 만들지 못했습니다.',
        }));
      } finally {
        requestsRef.current.delete(boardId);
        setAnalysisJobs((current) => {
          const next = { ...current };
          delete next[boardId];
          return next;
        });
      }
    },
    [isAdminUser, selectedDate, updateCachedSummary]
  );

  return {
    analysisJobs,
    analysisErrors,
    isAdminUser,
    requestReanalysis,
  };
}

function createPendingAnalysisJob(boardId: string): BoardAnalysisJobStatus {
  return {
    jobId: '',
    boardId,
    status: 'queued',
    progressPercent: 5,
    estimatedSecondsRemaining: 60,
    message: 'Analysis job queued.',
    tags: [],
  };
}

function isActiveAnalysisJob(job: BoardAnalysisJobStatus) {
  return job.status === 'queued' || job.status === 'running';
}

async function pollBoardAnalysisJob(
  jobId: string,
  onUpdate: (job: BoardAnalysisJobStatus) => void,
  attempt = 0
): Promise<BoardAnalysisJobStatus> {
  const latestJob = await getBoardAnalysisJob(jobId);
  onUpdate(latestJob);

  if (!isActiveAnalysisJob(latestJob) || attempt >= analysisPollLimit) {
    return latestJob;
  }

  await delay(analysisPollIntervalMs);
  return pollBoardAnalysisJob(jobId, onUpdate, attempt + 1);
}

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
