'use client';

import Link from 'next/link';

import { AsciiFlow } from './ascii-flow';
import { CrossCommunityStory } from './cross-community-story';
import {
  asciiMeter,
  formatActivityTime,
  formatActivityCount,
  formatActivityGrowth,
} from './activity-format';

import type { ActivityData } from './activity-data';

// Keep CSS modules after application imports (perfectionist/sort-imports).
// eslint-disable-next-line perfectionist/sort-imports
import styles from './activity-story.module.css';

type Props = {
  data?: ActivityData;
  isLoading: boolean;
  isError: boolean;
  isRefreshing?: boolean;
  onTopicSelect: (tag: string) => void;
  motionEnabled: boolean;
  isMotionReduced: boolean;
  onMotionToggle: () => void;
};

export function ActivityStory({
  data,
  isLoading,
  isError,
  isRefreshing,
  onTopicSelect,
  motionEnabled,
  isMotionReduced,
  onMotionToggle,
}: Props) {
  const hours = data?.windowHours ?? 24;
  const topics = data?.topics ?? [];
  const updated = formatActivityTime(data?.generatedAt);
  return (
    <>
      <section
        id="community-pulse"
        className={styles.story}
        aria-labelledby="pulse-title"
        data-ascii-home
      >
        <header className={styles.intro}>
          <div className={styles.terminalBar}>
            <span className={styles.eyebrow} aria-hidden="true">
              <span className={styles.cursor}>*</span> COMMUNITY PULSE / {hours}H
            </span>
            <button
              type="button"
              className={styles.motionToggle}
              aria-label="화면 움직임"
              aria-pressed={motionEnabled}
              disabled={isMotionReduced}
              title={isMotionReduced ? '기기의 모션 감소 설정이 적용되어 있습니다.' : undefined}
              onClick={onMotionToggle}
            >
              [{isMotionReduced ? '모션 감소' : motionEnabled ? '움직임 켜짐' : '움직임 꺼짐'}]
            </button>
          </div>
          <div className={styles.introBody}>
            <div className={styles.introCopy}>
              <p className={styles.prompt} aria-hidden="true">
                &gt; reading the room<span className={styles.cursor}>_</span>
              </p>
              <h1 id="pulse-title"># 최근 {hours}시간 커뮤니티 동향</h1>
              <p>흩어진 이야기에서, 지금의 흐름을 읽습니다.</p>
              <p className={styles.note}>여러 커뮤니티의 게시글, 요약, AI 태그를 한곳에서.</p>
              <p className={styles.note}>
                갱신:{' '}
                {updated ? (
                  <time dateTime={data?.generatedAt}>{updated}</time>
                ) : isLoading ? (
                  '불러오는 중...'
                ) : (
                  '집계 시각 없음'
                )}
                {' / '}최근 {hours}시간
              </p>
              <Link className={styles.feedLink} href="#popular-feed">
                [인기글 바로 보기 &gt;]
              </Link>
            </div>
            <div className={styles.signalPanel} aria-hidden="true">
              <p className={styles.signalCaption}>[ COMMUNITY FREQUENCIES ]</p>
              <AsciiFlow variant="signal" />
              <p className={styles.signalLegend}>posts --- tags --- connections</p>
            </div>
          </div>
          <dl className={styles.metrics} aria-label="최근 커뮤니티 집계">
            {[
              { label: '분석 게시글', value: data?.analyzedPostCount },
              { label: '고유 태그', value: data?.uniqueTagCount },
              { label: '표시 출처', value: data?.sourceCount },
              { label: '확인된 연결', value: data?.knownEdgeCount },
            ].map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value === undefined ? '-' : formatActivityCount(metric.value)}</dd>
              </div>
            ))}
          </dl>
        </header>

        <p className={styles.rule} aria-hidden="true">
          {'-'.repeat(110)}
        </p>
        <h2 id="tag-rankings-title">[01] 태그 순위</h2>
        <p className={styles.note}>최근 집계에 포함된 상위 {topics.length}개 태그 / Activity 순</p>
        {(isLoading || isError || isRefreshing) && (
          <p role="status">
            {isError
              ? data
                ? '집계 갱신에 실패해 마지막 데이터를 표시합니다.'
                : '태그 통계를 불러오지 못했습니다.'
              : isLoading
                ? '태그 통계를 불러오는 중...'
                : '최근 집계를 갱신하는 중...'}
          </p>
        )}
        <ol
          id="all-topic-rankings"
          className={styles.topicList}
          aria-labelledby="tag-rankings-title"
        >
          {topics.map((topic) => (
            <li key={topic.id}>
              <span className={styles.rank} aria-hidden="true">
                {String(topic.rank).padStart(2, '0')}
              </span>
              <div className={styles.topicContent}>
                <div className={styles.topicLine}>
                  <button
                    type="button"
                    data-topic-node={topic.id}
                    onClick={() => onTopicSelect(topic.label)}
                    aria-label={`${topic.label} 태그 게시글 보기`}
                  >
                    #{topic.label}
                  </button>
                  <span
                    className={styles.meter}
                    aria-label={`Activity ${Math.round(topic.activityScore)}`}
                  >
                    <span aria-hidden="true">{asciiMeter(topic.activityScore)}</span>{' '}
                    {Math.round(topic.activityScore)}
                  </span>
                </div>
                <p className={styles.note}>
                  {formatActivityCount(topic.volume)}개 게시글 / 증감{' '}
                  {formatActivityGrowth(topic.growthRate)} / 출처 {topic.sourceCount}곳
                </p>
              </div>
            </li>
          ))}
        </ol>
        {!isLoading && !isError && !topics.length && (
          <p role="status">
            최근 집계에 AI 태그가 없습니다. <Link href="/board">[게시판 보기 &gt;]</Link>
          </p>
        )}
        <details className={styles.scoreNote}>
          <summary>[지표 설명]</summary>
          <p>
            Activity는 언급량, 증감, 표시 출처, 확인된 연결을 현재 집계 안에서 비교한 상대
            지표입니다.
          </p>
          <p>
            증감은 최근 12시간과 이전 12시간 게시글 수의 +1 보정 비교입니다. 출처와 연결 수는 응답에
            포함된 범위만 표시합니다.
          </p>
        </details>
      </section>
      <CrossCommunityStory
        topic={isLoading ? undefined : (topics[0] ?? null)}
        windowHours={hours}
        isError={isError}
      />
    </>
  );
}
