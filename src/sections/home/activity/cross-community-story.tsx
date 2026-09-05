'use client';

import Link from 'next/link';
import * as React from 'react';

import type { ActivityTopic } from './activity-data';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './cross-community-story.module.css';

const MAX_SOURCE_CARDS = 6;
const ASCII_METER_LENGTH = 12;

const CONNECTOR_PATHS = [
  'M 455 292 C 350 285, 310 190, 222 151',
  'M 545 292 C 650 285, 690 190, 778 151',
  'M 455 358 C 350 365, 310 460, 222 499',
  'M 545 358 C 650 365, 690 460, 778 499',
  'M 500 285 C 500 235, 500 195, 500 142',
  'M 500 365 C 500 415, 500 455, 500 508',
] as const;

type CrossCommunityStoryProps = {
  topic?: ActivityTopic | null;
  windowHours?: number;
  generatedAt?: string;
  id?: string;
};

type SourceCardStyle = React.CSSProperties & {
  '--source-card-width': string;
  '--source-card-height': string;
};

type SeekableTimeline = {
  duration: number;
  seek: (time: number, muteCallbacks?: boolean) => SeekableTimeline;
  revert: () => SeekableTimeline;
};

export function CrossCommunityStory({
  topic,
  windowHours = 24,
  generatedAt,
  id = 'cross-community',
}: CrossCommunityStoryProps) {
  const storyRef = React.useRef<HTMLElement>(null);

  useCrossCommunityMotion(storyRef, topic);

  if (topic === undefined) {
    return (
      <StoryState
        id={id}
        eyebrow="SOURCE DISTRIBUTION"
        message="출처별 통계를 불러오는 중입니다."
      />
    );
  }

  if (topic === null || topic.sources.length === 0) {
    return (
      <StoryState
        id={id}
        eyebrow="SOURCE DISTRIBUTION"
        message="최근 집계에 출처별 통계가 없습니다."
      />
    );
  }

  const sources = topic.sources.slice(0, MAX_SOURCE_CARDS);
  const generatedAtLabel = formatGeneratedAt(generatedAt);

  return (
    <section ref={storyRef} id={id} className={styles.story} aria-labelledby={`${id}-title`}>
      <div className={styles.stage} data-cross-stage>
        <div className={styles.stageInner}>
          <header className={styles.heading} data-story-heading>
            <div>
              <p className={styles.eyebrow}>SOURCE DISTRIBUTION · TAG #{topic.rank}</p>
              <h2 id={`${id}-title`}>
                #{topic.label}
                <br /> 출처별 게시글 분포
              </h2>
            </div>

            <p className={styles.timeNote}>
              최근 {formatNumber(windowHours)}시간 기준
              {generatedAtLabel ? <span>갱신 {generatedAtLabel}</span> : null}
            </p>
          </header>

          <div className={styles.network}>
            <svg
              className={styles.connectors}
              viewBox="0 0 1000 650"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {sources.map((source, index) => (
                <path key={source.id} data-connector pathLength="1" d={CONNECTOR_PATHS[index]} />
              ))}
            </svg>

            <article
              className={styles.topicCard}
              data-topic-card
              aria-labelledby={`${id}-topic-title`}
              aria-describedby={`${id}-score-note`}
            >
              <div className={styles.topicTopline}>
                <span>TRENDING #{topic.rank}</span>
                <span aria-label={`활동 점수 ${formatScore(topic.activityScore)}`}>
                  ACTIVITY {formatScore(topic.activityScore)}
                </span>
              </div>

              <div className={styles.topicBody}>
                <h3 id={`${id}-topic-title`} className={styles.topicLabel}>
                  #{topic.label}
                </h3>
                <div className={styles.topicMetrics}>
                  <span>{formatNumber(topic.volume)}개 게시글</span>
                  <span>표시 출처 {formatNumber(topic.sourceCount)}곳</span>
                  <span>{formatGrowth(topic.growthRate)}</span>
                </div>
              </div>

              <p id={`${id}-score-note`} className={styles.topicFootnote}>
                Activity는 최근 언급량·증가율·응답에 포함된 출처 수·태그 연결도를 비교한 상대
                점수입니다.
              </p>
            </article>

            <div className={styles.sourceGrid} aria-label={`${topic.label} 태그의 커뮤니티별 분포`}>
              {sources.map((source, index) => {
                const share = clamp(source.contributionRatio, 0, 1);
                const href = createSourceHref(topic.label, source.site);
                const sourceName = source.name.trim() || source.site;
                const cardStyle: SourceCardStyle = {
                  '--source-card-width': `${250 + share * 80}px`,
                  '--source-card-height': `${152 + share * 44}px`,
                };

                return (
                  <Link
                    key={source.id}
                    href={href}
                    className={styles.sourceCard}
                    style={cardStyle}
                    data-source-card
                    aria-label={`${sourceName}에서 ${topic.label} 태그 게시글 ${formatNumber(
                      source.contribution
                    )}개 보기`}
                  >
                    <div className={styles.sourceContent} data-source-content>
                      <div className={styles.sourceTopline}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <span>{formatPercent(share)}</span>
                      </div>

                      <h3>{sourceName}</h3>
                      <p className={styles.contribution}>
                        <strong>{formatNumber(source.contribution)}</strong>
                        <span>관련 게시글</span>
                      </p>

                      <AsciiMeter value={share} />

                      {source.representativePost ? (
                        <p className={styles.representativePost}>
                          <span>대표 글</span>
                          {source.representativePost.title}
                        </p>
                      ) : (
                        <p className={styles.representativePostEmpty}>연결된 Top 10 글 없음</p>
                      )}

                      <span className={styles.cardAction} aria-hidden="true">
                        이 출처에서 보기 <span>↗</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <p className={styles.readingNote} data-reading-note>
            카드의 크기와 막대는 해당 태그 게시글 중 출처가 차지한 비율을 나타냅니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function StoryState({ id, eyebrow, message }: { id: string; eyebrow: string; message: string }) {
  return (
    <section
      id={id}
      className={`${styles.story} ${styles.stateStory}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.statePanel}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={`${id}-title`}>커뮤니티별 게시글 분포</h2>
        <p>{message}</p>
        <Link href="/board">전체 게시판 보기</Link>
      </div>
    </section>
  );
}

function AsciiMeter({ value }: { value: number }) {
  const filled = Math.round(clamp(value, 0, 1) * ASCII_METER_LENGTH);
  const meter = `${'█'.repeat(filled)}${'░'.repeat(ASCII_METER_LENGTH - filled)}`;

  return (
    <div
      className={styles.asciiMeter}
      role="img"
      aria-label={`태그 게시글 중 ${formatPercent(value)}`}
    >
      <span aria-hidden="true">{meter}</span>
      <span aria-hidden="true">SHARE</span>
    </div>
  );
}

function useCrossCommunityMotion(
  storyRef: React.RefObject<HTMLElement | null>,
  topic?: ActivityTopic | null
) {
  React.useEffect(() => {
    const story = storyRef.current;
    if (!story || !topic || topic.sources.length === 0) {
      return undefined;
    }

    const staticLayoutQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce), (max-height: 700px)'
    );
    if (staticLayoutQuery.matches) {
      story.dataset.motion = 'reduced';
      return undefined;
    }

    let active = true;
    let frameId = 0;
    let resizeFrameId = 0;
    let timeline: SeekableTimeline | null = null;
    let latestProgress = 0;
    let renderedProgress = -1;
    let storyNearViewport = true;
    let visibilityObserver: IntersectionObserver | null = null;
    const stage = story.querySelector<HTMLElement>('[data-cross-stage]');

    const readProgress = () => {
      const rect = story.getBoundingClientRect();
      const stickyTop = stage ? Number.parseFloat(window.getComputedStyle(stage).top) || 0 : 0;
      const travel = Math.max(1, story.offsetHeight - (stage?.offsetHeight ?? window.innerHeight));
      return clamp((stickyTop - rect.top) / travel, 0, 1);
    };

    const render = () => {
      frameId = 0;
      latestProgress = readProgress();
      if (Math.abs(latestProgress - renderedProgress) < 0.0005) {
        return;
      }
      renderedProgress = latestProgress;
      story.style.setProperty('--story-progress', latestProgress.toFixed(4));
      timeline?.seek(timeline.duration * latestProgress, true);
    };

    const requestRender = () => {
      if (storyNearViewport && frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const buildTimeline = async () => {
      const { createTimeline } = await import('animejs');
      if (!active) {
        return;
      }

      const topicCard = story.querySelector<HTMLElement>('[data-topic-card]');
      const heading = story.querySelector<HTMLElement>('[data-story-heading]');
      const sourceCards = Array.from(story.querySelectorAll<HTMLElement>('[data-source-card]'));
      const sourceContents = Array.from(
        story.querySelectorAll<HTMLElement>('[data-source-content]')
      );
      const connectors = Array.from(story.querySelectorAll<SVGPathElement>('[data-connector]'));
      const readingNote = story.querySelector<HTMLElement>('[data-reading-note]');

      if (!topicCard || sourceCards.length === 0) {
        return;
      }

      timeline?.revert();

      const topicRect = topicCard.getBoundingClientRect();
      const topicCenterX = topicRect.left + topicRect.width / 2;
      const topicCenterY = topicRect.top + topicRect.height / 2;
      const offsets = sourceCards.map((card) => {
        const cardRect = card.getBoundingClientRect();
        return {
          x: topicCenterX - (cardRect.left + cardRect.width / 2),
          y: topicCenterY - (cardRect.top + cardRect.height / 2),
        };
      });

      const nextTimeline = createTimeline({ autoplay: false, defaults: { ease: 'inOutQuad' } }).add(
        topicCard,
        {
          opacity: [0.86, 1],
          scale: [0.88, 1],
          duration: 240,
        },
        0
      );

      if (heading) {
        nextTimeline.add(
          heading,
          {
            opacity: [0.72, 1],
            translateY: [12, 0],
            duration: 220,
          },
          20
        );
      }

      sourceCards.forEach((card, index) => {
        nextTimeline.add(
          card,
          {
            opacity: [0, 1],
            scale: [0.68, 1],
            translateX: [offsets[index].x, 0],
            translateY: [offsets[index].y, 0],
            duration: 390,
          },
          360 + index * 34
        );
      });

      connectors.forEach((connector, index) => {
        nextTimeline.add(
          connector,
          {
            opacity: [0, 1],
            strokeDashoffset: [1, 0],
            duration: 300,
          },
          455 + index * 26
        );
      });

      sourceContents.forEach((content, index) => {
        nextTimeline.add(
          content,
          {
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 190,
          },
          560 + index * 30
        );
      });

      if (readingNote) {
        nextTimeline.add(
          readingNote,
          {
            opacity: [0, 1],
            translateY: [8, 0],
            duration: 180,
          },
          720
        );
      }

      timeline = nextTimeline as SeekableTimeline;
      story.dataset.motion = 'ready';
      latestProgress = readProgress();
      timeline.seek(timeline.duration * latestProgress, true);
    };

    const rebuildTimeline = () => {
      if (resizeFrameId !== 0) {
        window.cancelAnimationFrame(resizeFrameId);
      }
      resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = 0;
        buildTimeline().catch(handleMotionError);
      });
    };

    const handleMotionError = () => {
      if (active) {
        story.dataset.motion = 'unavailable';
      }
    };

    story.dataset.motion = 'loading';
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', rebuildTimeline);
    if (typeof IntersectionObserver !== 'undefined') {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          storyNearViewport = Boolean(entry?.isIntersecting);
          if (storyNearViewport) {
            renderedProgress = -1;
            requestRender();
          }
        },
        { rootMargin: '50% 0px' }
      );
      visibilityObserver.observe(story);
    }
    render();
    buildTimeline().catch(handleMotionError);

    return () => {
      active = false;
      window.removeEventListener('scroll', requestRender);
      window.removeEventListener('resize', rebuildTimeline);
      visibilityObserver?.disconnect();
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      if (resizeFrameId !== 0) {
        window.cancelAnimationFrame(resizeFrameId);
      }
      timeline?.revert();
      story.style.removeProperty('--story-progress');
      delete story.dataset.motion;
    };
  }, [storyRef, topic]);
}

function createSourceHref(tag: string, site: string) {
  const query = new URLSearchParams({ tag, sites: site });
  return `/board?${query.toString()}`;
}

function formatGeneratedAt(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0
  );
}

function formatScore(value: number) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function formatPercent(value: number) {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

function formatGrowth(value: number) {
  if (!Number.isFinite(value)) {
    return '증가율 집계 없음';
  }

  const sign = value > 0 ? '+' : '';
  return `최근 구간 ${sign}${Math.round(value)}%`;
}

function clamp(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, value));
}
