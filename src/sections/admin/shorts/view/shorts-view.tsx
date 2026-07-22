'use client';

import type { AlertColor } from '@mui/material';
import type { ShortsScene, ShortsSource, Top10ShortsPackage } from 'src/api/board-api';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Select,
  Divider,
  Snackbar,
  MenuItem,
  Accordion,
  InputLabel,
  Typography,
  CardContent,
  FormControl,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useTop10ShortsPackage } from 'src/hooks/use-top10-shorts-package';
import { TOP_BOARDS_TODAY, useTopBoardHistoryDates } from 'src/hooks/use-top-boards';

import { resolveThumbnailSrc } from 'src/components/board-post/board-post-utils';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SEOUL_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Seoul',
});
const HISTORY_DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  timeZone: 'Asia/Seoul',
});

type ToastState = {
  message: string;
  severity: AlertColor;
} | null;

export function ShortsView() {
  const [selectedDate, setSelectedDate] = useState(TOP_BOARDS_TODAY);
  const [toast, setToast] = useState<ToastState>(null);
  const {
    data: storedDates = [],
    isError: isDatesError,
    isPending: isDatesPending,
  } = useTopBoardHistoryDates();
  const {
    data: shortsPackage,
    isError,
    isPending,
    isFetching,
    refetch,
  } = useTop10ShortsPackage(selectedDate);
  const historyDates = useMemo(() => {
    const today = getTodayInSeoul();
    return Array.from(new Set(storedDates))
      .filter((date) => ISO_DATE_PATTERN.test(date) && date < today)
      .sort((left, right) => right.localeCompare(left));
  }, [storedDates]);
  const exportPackage = useMemo(
    () => (shortsPackage ? withResolvedThumbnailUrls(shortsPackage) : null),
    [shortsPackage]
  );

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ message: `${label}을(를) 복사했습니다.`, severity: 'success' });
    } catch {
      setToast({ message: '클립보드에 복사하지 못했습니다.', severity: 'error' });
    }
  };

  const downloadJson = () => {
    if (!exportPackage) return;

    const blob = new Blob([JSON.stringify(exportPackage, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `top10-shorts-${exportPackage.rankingDate}.json`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setToast({ message: 'Shorts JSON 파일을 만들었습니다.', severity: 'success' });
  };

  return (
    <Box sx={{ width: 'min(100%, 1080px)', mx: 'auto', py: { xs: 1, md: 2 } }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', sm: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <MovieOutlinedIcon sx={{ color: '#F54E00' }} />
              <Typography variant="overline" color="text.secondary">
                Admin only
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ mt: 0.5 }}>
              YouTube Shorts Studio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Top10을 10→1 카운트다운 영상용 장면, 내레이션, Nano Banana 프롬프트로 묶습니다.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/top10"
            color="inherit"
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
          >
            Top10으로 돌아가기
          </Button>
        </Stack>

        <Alert severity="info" icon={<AutoAwesomeOutlinedIcon />}>
          Nano Banana는 장면 이미지를 만들고, 실제 MP4는 내레이션·자막·이미지를 영상 편집 도구에서
          조립합니다. 원문 썸네일은 권리를 확인한 경우에만 참조 이미지로 사용하세요.
        </Alert>

        <Card variant="outlined">
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{
                alignItems: { xs: 'stretch', md: 'flex-end' },
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  제작 기준일
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  오늘 순위 또는 저장된 과거 Top10으로 패키지를 생성합니다.
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 260 } }}>
                <InputLabel id="shorts-date-select-label">날짜 선택</InputLabel>
                <Select
                  labelId="shorts-date-select-label"
                  value={selectedDate}
                  label="날짜 선택"
                  onChange={(event) => setSelectedDate(event.target.value)}
                >
                  <MenuItem value={TOP_BOARDS_TODAY}>오늘</MenuItem>
                  {historyDates.map((date) => (
                    <MenuItem key={date} value={date}>
                      {formatHistoryDateLabel(date)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            {isDatesPending && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                저장된 날짜를 확인하고 있습니다.
              </Typography>
            )}
            {isDatesError && (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                과거 날짜를 불러오지 못했습니다. 오늘 패키지는 계속 사용할 수 있습니다.
              </Alert>
            )}
            {selectedDate === TOP_BOARDS_TODAY && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                오늘 순위는 약 5분마다 바뀔 수 있으며 이 화면도 5분마다 자동으로 다시 확인합니다.
                확정 제작본은 날짜가 지난 뒤 저장된 순위를 선택하는 편이 안전합니다.
              </Typography>
            )}
            {selectedDate !== TOP_BOARDS_TODAY && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                과거 날짜는 당시 순위·점수를 사용하지만 제목, 요약, URL과 썸네일은 현재 게시물
                데이터입니다. 당시 원문 상태와 다를 수 있습니다.
              </Typography>
            )}
          </CardContent>
        </Card>

        {isPending && <PackageLoading />}

        {isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          >
            Shorts 제작 데이터를 불러오지 못했습니다. 관리자 설정과 Top10 데이터를 확인해 주세요.
          </Alert>
        )}

        {shortsPackage && !isError && (
          <>
            <PackageSummary shortsPackage={shortsPackage} isFetching={isFetching} />

            {shortsPackage.readiness.warnings.map((warning) => (
              <Alert key={warning} severity="warning">
                {warning}
              </Alert>
            ))}

            <PackageActions
              shortsPackage={exportPackage ?? shortsPackage}
              onCopy={copyText}
              onDownload={downloadJson}
            />

            <VideoCopy shortsPackage={shortsPackage} onCopy={copyText} />

            <Box component="section" aria-labelledby="shorts-scenes-title">
              <Typography id="shorts-scenes-title" variant="h5" sx={{ mb: 1, fontWeight: 800 }}>
                장면별 제작 데이터
              </Typography>
              <Stack spacing={1}>
                {shortsPackage.scenes.map((scene) => (
                  <SceneAccordion
                    key={scene.id}
                    scene={scene}
                    source={shortsPackage.sources.find(
                      (candidate) => candidate.rank === scene.sourceRank
                    )}
                    onCopy={copyText}
                  />
                ))}
              </Stack>
            </Box>

            <SourcesCard sources={shortsPackage.sources} />

            <Alert severity="warning">
              <Typography component="div" variant="subtitle2" sx={{ fontWeight: 800 }}>
                게시 전 확인
              </Typography>
              <Box component="ul" sx={{ my: 0.75, pl: 2.5 }}>
                {shortsPackage.notices.map((notice) => (
                  <li key={notice}>{notice}</li>
                ))}
              </Box>
            </Alert>
          </>
        )}
      </Stack>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2400}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function PackageLoading() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }} role="status">
          <CircularProgress size={24} aria-label="Shorts 제작 데이터 불러오는 중" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Top10을 제작 패키지로 변환하고 있습니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              원문 출처와 순위는 서버에서 고정해 URL 환각을 방지합니다.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PackageSummary({
  shortsPackage,
  isFetching,
}: {
  shortsPackage: Top10ShortsPackage;
  isFetching: boolean;
}) {
  const { readiness, production } = shortsPackage;
  const stats = [
    { label: '소스', value: `${readiness.sourceCount}/10` },
    { label: '요약', value: `${readiness.summaryCount}/${readiness.sourceCount}` },
    { label: '길이', value: `${production.targetDurationSeconds}초` },
    { label: '화면', value: production.aspectRatio },
  ];

  return (
    <Box
      component="section"
      aria-label="Shorts 패키지 준비 상태"
      sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1 }}
    >
      {stats.map((stat) => (
        <Card key={stat.label} variant="outlined">
          <CardContent sx={{ py: '14px !important' }}>
            <Typography variant="caption" color="text.secondary">
              {stat.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {stat.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
      <Card variant="outlined" sx={{ gridColumn: '1 / -1' }}>
        <CardContent sx={{ py: '14px !important' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nano Banana 생성 프리셋
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 700 }}>
                {production.recommendedImageModel} · Interactions API · 최종{' '}
                {production.finalImageSize} ({production.finalOutputPixels})
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                size="small"
                color={readiness.dataReady ? 'success' : 'warning'}
                label={readiness.dataReady ? '데이터 준비됨' : '데이터 확인 필요'}
              />
              <Chip
                size="small"
                label={`초안 ${production.draftImageModel} · ${production.draftOutputPixels}`}
              />
              <Button
                component="a"
                href="https://ai.google.dev/gemini-api/docs/image-generation"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="inherit"
                endIcon={<OpenInNewRoundedIcon />}
              >
                공식 이미지 가이드
              </Button>
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {production.timingNote}
          </Typography>
        </CardContent>
      </Card>
      {isFetching && (
        <Typography variant="caption" color="text.secondary" sx={{ gridColumn: '1 / -1' }}>
          최신 Top10을 확인하고 있습니다.
        </Typography>
      )}
    </Box>
  );
}

function PackageActions({
  shortsPackage,
  onCopy,
  onDownload,
}: {
  shortsPackage: Top10ShortsPackage;
  onCopy: (label: string, value: string) => Promise<void>;
  onDownload: () => void;
}) {
  const prompts = shortsPackage.scenes
    .map((scene) => `[${scene.id}]\n${scene.nanoBananaPrompt}`)
    .join('\n\n');
  const draftRequests = JSON.stringify(shortsPackage.nanoBananaDraftRequests, null, 2);
  const finalRequestTemplates = JSON.stringify(
    shortsPackage.nanoBananaFinalRequestTemplates,
    null,
    2
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              한 번에 내보내기
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lite 1K 초안은 병렬 검토합니다. intro 승인 뒤 Base64 이미지를 최종 템플릿의
              자리표시자에 넣으면 Flash 2K 요청도 병렬 실행할 수 있습니다. 전체 JSON은 게시 권리
              검토가 끝난 승인본은 아닙니다.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Button variant="contained" startIcon={<DownloadOutlinedIcon />} onClick={onDownload}>
              JSON 다운로드
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => onCopy('전체 프롬프트', prompts)}
            >
              프롬프트 전체 복사
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => onCopy('1K 초안 요청 큐 JSON', draftRequests)}
            >
              1K 초안 큐 복사
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => onCopy('2K 최종 러너 템플릿 JSON', finalRequestTemplates)}
            >
              2K 최종 템플릿 복사
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => onCopy('내레이션', shortsPackage.video.narrationScript)}
            >
              내레이션 복사
            </Button>
          </Stack>
          <Alert severity="info" sx={{ mt: 0.5 }}>
            <Typography variant="body2">
              {shortsPackage.production.continuityGuide.instruction}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {shortsPackage.production.continuityGuide.queueUsage}
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
}

function VideoCopy({
  shortsPackage,
  onCopy,
}: {
  shortsPackage: Top10ShortsPackage;
  onCopy: (label: string, value: string) => Promise<void>;
}) {
  const fields = [
    { label: '영상 제목', value: shortsPackage.video.title },
    { label: '첫 3초 훅', value: shortsPackage.video.hook },
    { label: 'YouTube 설명', value: shortsPackage.video.description },
  ];

  return (
    <Card component="section" aria-labelledby="video-copy-title" variant="outlined">
      <CardContent>
        <Typography id="video-copy-title" variant="h6" sx={{ fontWeight: 800 }}>
          업로드 문구
        </Typography>
        <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
          {fields.map((field) => (
            <Stack
              key={field.label}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ py: 1.25, alignItems: { xs: 'stretch', sm: 'flex-start' } }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {field.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.25, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {field.value}
                </Typography>
              </Box>
              <Button
                size="small"
                color="inherit"
                aria-label={`${field.label} 복사`}
                startIcon={<ContentCopyRoundedIcon />}
                onClick={() => onCopy(field.label, field.value)}
              >
                복사
              </Button>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SceneAccordion({
  scene,
  source,
  onCopy,
}: {
  scene: ShortsScene;
  source?: ShortsSource;
  onCopy: (label: string, value: string) => Promise<void>;
}) {
  const thumbnailSrc = resolveThumbnailSrc(source?.thumbnailUrl);
  const endSecond = scene.startSecond + scene.durationSeconds;

  return (
    <Accordion disableGutters variant="outlined" sx={{ '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: '100%', pr: 1, alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Chip
            size="small"
            label={`${scene.startSecond}–${endSecond}초`}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`음성 약 ${scene.estimatedNarrationSeconds}초`}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {scene.overlayText}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {scene.type === 'ranking' ? `순위 장면 · ${scene.sourceRank}위` : scene.type}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {thumbnailSrc && (
            <Box
              component="img"
              src={thumbnailSrc}
              alt={`${source?.title ?? scene.overlayText} 원문 참고 이미지`}
              sx={{
                width: '100%',
                maxHeight: 260,
                objectFit: 'cover',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            />
          )}
          <CopyBlock
            label="내레이션"
            value={scene.narration}
            copyAriaLabel={`${scene.overlayText} 내레이션 복사`}
            onCopy={() => onCopy(`${scene.overlayText} 내레이션`, scene.narration)}
          />
          <CopyBlock
            label="Nano Banana 이미지 프롬프트"
            value={scene.nanoBananaPrompt}
            copyAriaLabel={`${scene.overlayText} Nano Banana 이미지 프롬프트 복사`}
            onCopy={() => onCopy(`${scene.overlayText} 프롬프트`, scene.nanoBananaPrompt)}
          />
          {source && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                size="small"
                color={source.hasSummary ? 'success' : 'warning'}
                label={source.hasSummary ? '요약 준비됨' : '제목 기반 초안'}
              />
              {source.thumbnailUrl && (
                <Chip size="small" color="warning" label="참조 이미지 권리 미확인" />
              )}
              {source.isValid && isHttpUrl(source.url) ? (
                <Button
                  component="a"
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  color="inherit"
                  endIcon={<OpenInNewRoundedIcon />}
                >
                  {source.site} 원문 확인
                </Button>
              ) : (
                <Chip size="small" color="error" label="원문 URL 확인 필요" />
              )}
            </Stack>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function CopyBlock({
  label,
  value,
  copyAriaLabel,
  onCopy,
}: {
  label: string;
  value: string;
  copyAriaLabel: string;
  onCopy: () => void;
}) {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        <Button
          size="small"
          color="inherit"
          aria-label={copyAriaLabel}
          onClick={onCopy}
          startIcon={<ContentCopyRoundedIcon />}
        >
          복사
        </Button>
      </Stack>
      <Box
        sx={{
          mt: 0.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: '#f4f4f1',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Box>
  );
}

function SourcesCard({ sources }: { sources: ShortsSource[] }) {
  return (
    <Card component="section" aria-labelledby="shorts-sources-title" variant="outlined">
      <CardContent>
        <Typography id="shorts-sources-title" variant="h6" sx={{ fontWeight: 800 }}>
          원문 출처
        </Typography>
        <Box component="ol" sx={{ my: 1, pl: 3 }}>
          {sources.map((source) => (
            <Box
              component="li"
              key={`${source.rank}-${source.boardId || source.site}`}
              sx={{ py: 0.75 }}
            >
              <Typography variant="body2" component="span">
                {source.title}{' '}
              </Typography>
              {source.isValid && isHttpUrl(source.url) ? (
                <Typography
                  component="a"
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="caption"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  [{source.site} 원문]
                </Typography>
              ) : (
                <Typography component="span" variant="caption" color="error">
                  [원문 URL 확인 필요]
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function getTodayInSeoul() {
  const parts = SEOUL_DATE_PARTS_FORMATTER.formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((datePart) => datePart.type === type)?.value ?? '';

  return `${part('year')}-${part('month')}-${part('day')}`;
}

function formatHistoryDateLabel(date: string) {
  return HISTORY_DATE_LABEL_FORMATTER.format(new Date(`${date}T00:00:00+09:00`));
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function withResolvedThumbnailUrls(shortsPackage: Top10ShortsPackage): Top10ShortsPackage {
  return {
    ...shortsPackage,
    sources: shortsPackage.sources.map((source) => ({
      ...source,
      thumbnailUrl: resolveThumbnailSrc(source.thumbnailUrl) || null,
    })),
  };
}
