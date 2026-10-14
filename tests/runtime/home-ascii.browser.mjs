// Manual browser verification: build first; requires Playwright and Chromium.
// Fixtures are test-only. Requests are intercepted; no listening server is opened.
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(path.join(tmpdir(), 'codex-pulse-browser/node_modules/playwright'));
}
const root = process.cwd();
const artifacts = path.join(tmpdir(), 'codex-home-issues-review');
await mkdir(artifacts, { recursive: true });
const briefing = {
  generated_at: '2026-10-11T02:00:00Z',
  date: '2026-10-11',
  started_at: '2026-10-10T15:00:00Z',
  time_zone: 'Asia/Seoul',
  total_posts: 359,
  total_issues: 10,
  source_count: 3,
  issues: [
    [
      '서울 지하철 파업 예고와 출근길 운행 차질',
      '노조가 파업을 예고했습니다. 교섭이 진행 중이며 운행 차질 여부가 관심을 모으고 있습니다.',
      86,
    ],
    [
      '전세사기 피해 지원 법안 논의',
      '전세사기 피해자 지원 방안을 다룬 게시글이 여러 커뮤니티에서 공유됐습니다. 지원 범위와 후속 대책에 대한 의견이 이어졌습니다.',
      54,
    ],
    [
      '개인정보 유출 수사와 소비자 피해 대응',
      '개인정보 유출 사건에 대한 수사가 진행되고 있습니다. 이용자들은 피해 확인과 대응 방법을 공유하고 있습니다.',
      44,
    ],
    ...[
      '지역 버스 노선 개편과 통학 교통 대책',
      '공공요금 인상에 따른 가계 부담 논의',
      '학교 급식 안전 점검과 학부모 의견',
      '청년 주거 지원 신청과 지원 범위',
      '노동 현장 안전 기준 개선 논의',
      '집중호우 대비와 지역 침수 예방',
      '소비자 환불 제도 개선과 피해 구제',
    ].map((title) => [
      title,
      '브라우저 검증용 이슈입니다. 관련 게시글의 요약과 원문을 한 이슈씩 살펴볼 수 있습니다.',
      25,
    ]),
  ].map(([title, summary, count], index) => ({
    id: 'fixture-' + index,
    rank: index + 1,
    title,
    summary,
    post_count: count,
    source_count: 3,
    sources: [
      { site: 'theqoo', site_label: '더쿠', post_count: count - 20 },
      { site: 'dcinside', site_label: '디시인사이드', post_count: 12 },
      { site: 'ppomppu', site_label: '뽐뿌', post_count: 8 },
    ],
    posts: [
      {
        board_id: 'fixture-' + index,
        site: 'theqoo',
        site_label: '더쿠',
        title: '원문: ' + title,
        url: 'https://example.com/post/' + index,
      },
    ],
  })),
};
const posts = Array.from({ length: 10 }, (_, index) => ({
  _id: 'post-' + index,
  no: index + 1,
  category: 'issue',
  site: 'theqoo',
  site_label: '더쿠',
  title: '브라우저 검증용 인기 게시글 ' + (index + 1),
  url: 'https://example.com/popular/' + index,
  create_time: '2026-10-11T02:00:00Z',
  tags: ['사회'],
  gpt_answer: '브라우저 검증용 게시글 요약입니다.',
  analysis_status: 'done',
  daily_score: 100 - index,
  native_view_count: 10000,
  native_like_count: 50,
  native_comment_count: 10,
}));
const timeline = {
  generated_at: '2026-10-11T02:05:00Z',
  window_hours: 24,
  rankings: Array.from({ length: 24 }, (_, index) => {
    const startedAt = new Date(Date.UTC(2026, 9, 10, 3 + index));
    return {
      started_at: startedAt.toISOString(),
      captured_at: index >= 12 ? new Date(startedAt.getTime() + 5 * 60_000).toISOString() : null,
      is_live: index === 23,
      posts:
        index < 12
          ? []
          : posts
              .map((post, postIndex) => ({
                board_id: post._id,
                title: post.title,
                site: post.site,
                site_label: post.site_label,
                url: post.url,
                rank: ((postIndex + 23 - index) % 10) + 1,
              }))
              .sort((a, b) => a.rank - b.rank),
    };
  }),
};
const cacheRoot = path.join(process.env.LOCALAPPDATA || tmpdir(), 'ms-playwright');
const cachedChrome = existsSync(cacheRoot)
  ? readdirSync(cacheRoot)
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      .map((name) => path.join(cacheRoot, name, 'chrome-win64/chrome.exe'))
      .find(existsSync)
  : undefined;
const browser = await playwright.chromium.launch({
  headless: true,
  channel:
    !process.env.PULSE_CHROMIUM_PATH &&
    !existsSync(playwright.chromium.executablePath()) &&
    !cachedChrome
      ? 'msedge'
      : undefined,
  executablePath:
    process.env.PULSE_CHROMIUM_PATH ||
    (existsSync(playwright.chromium.executablePath()) ? undefined : cachedChrome),
});
const errors = [];

async function makePage(viewport, mode = 'normal') {
  const context = await browser.newContext({
    viewport,
    reducedMotion: mode === 'autoplay' ? 'no-preference' : 'reduce',
  });
  const page = await context.newPage();
  let briefingRequests = 0;
  let rankingRequests = 0;
  if (mode === 'refresh' || mode === 'stale' || mode === 'rank-stale' || mode === 'autoplay')
    await page.clock.install();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
        headers: {
          'access-control-allow-origin': 'http://pulse.invalid',
          'access-control-allow-credentials': 'true',
        },
      });
    if (url.pathname.includes('/boards/issues/briefing')) {
      briefingRequests += 1;
      if (mode === 'error' || (mode === 'stale' && briefingRequests > 1))
        return json({ message: 'Fixture error' }, 500);
      if (mode === 'empty')
        return json({ ...briefing, issues: [], total_posts: 0, total_issues: 0, source_count: 0 });
      if (mode === 'refresh' && briefingRequests > 1)
        return json({ ...briefing, total_posts: 360 });
      return json(briefing);
    }
    if (url.pathname.includes('/boards/daily/hourly-rankings')) {
      rankingRequests += 1;
      if (mode === 'rank-error' || (mode === 'rank-stale' && rankingRequests > 1))
        return json({ message: 'Fixture ranking error' }, 500);
      if (mode === 'rank-empty' || mode === 'rank-current')
        return json({
          ...timeline,
          rankings: timeline.rankings.map((bucket) =>
            mode === 'rank-current' && bucket.is_live
              ? bucket
              : { ...bucket, captured_at: null, posts: [] }
          ),
        });
      return json(timeline);
    }
    if (url.pathname.includes('/boards/daily')) return json(posts);
    if (url.pathname.includes('/boards/filters')) return json({ sites: [] });
    if (url.hostname !== 'pulse.invalid') return json(null, 401);
    let file;
    if (url.pathname === '/') file = path.join(root, '.next/server/app/index.html');
    else if (url.pathname.startsWith('/_next/static/'))
      file = path.join(root, '.next/static', url.pathname.slice('/_next/static/'.length));
    else file = path.join(root, 'public', decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) return route.abort();
    const type =
      {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.woff2': 'font/woff2',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
      }[path.extname(file)] || 'application/octet-stream';
    try {
      return route.fulfill({ contentType: type, body: await readFile(file) });
    } catch {
      return route.fulfill({ status: 404, body: '' });
    }
  });
  await page.goto('http://pulse.invalid/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('[data-ascii-home]').length === 1);
  return {
    page,
    context,
    requests: () => briefingRequests,
    rankingRequests: () => rankingRequests,
  };
}

try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ]) {
    const { page, context } = await makePage(viewport);
    await page.getByRole('heading', { name: briefing.issues[0].title }).waitFor();
    assert.equal(await page.locator('#today-issues article').count(), 1);
    assert.equal(await page.locator('#today-issues ol > li').count(), 10);
    const storyWidth = await page
      .locator('#community-pulse')
      .evaluate((element) => element.getBoundingClientRect().width);
    assert.ok(storyWidth <= 960, 'the closeup stays within the existing home column');
    assert.equal(await page.locator('#hourly-tag-rankings, #tag-rankings').count(), 0);
    const chart = page.locator('#hourly-post-rankings');
    await chart.getByRole('img').waitFor();
    assert.equal(await chart.locator('[data-rank-series]').count(), 10);
    assert.equal(
      await page.getByRole('link', { name: '[순위 변화]', exact: true }).getAttribute('href'),
      '#hourly-post-rankings'
    );
    await chart.getByRole('button', { name: '[6시간]' }).click();
    assert.equal(await chart.getByRole('slider').getAttribute('max'), '5');
    await chart.getByRole('combobox', { name: '비교 게시글' }).selectOption('post-0');
    assert.equal(await chart.locator('[data-rank-series]').count(), 1);
    await chart.getByRole('slider').focus();
    await chart.getByRole('slider').press('Home');
    assert.equal(await chart.getByText('더쿠 / 6위', { exact: true }).count(), 1);
    await chart.getByRole('combobox').selectOption('');
    await chart.getByRole('button', { name: '[24시간]' }).click();
    await chart.getByRole('slider').focus();
    await chart.getByRole('slider').press('End');
    assert.equal(await page.locator('#today-issues button[aria-pressed="true"]').count(), 1);
    assert.equal(await page.getByText('게시글 86개', { exact: true }).count(), 1);
    assert.equal(
      await page.getByRole('link', { name: '[오늘의 이슈]', exact: true }).getAttribute('href'),
      '#today-issues'
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    assert.equal(overflow, false, 'the page should fit the viewport at ' + viewport.width);
    await page.locator('#today-issues summary').first().click();
    assert.equal(
      await page.locator('#today-issues a[target="_blank"]').first().getAttribute('href'),
      'https://example.com/post/0'
    );
    await page
      .getByRole('button', { name: '10위 이슈 클로즈업: ' + briefing.issues[9].title })
      .click();
    assert.equal(await page.locator('#pulse-title').textContent(), briefing.issues[9].title);
    await page.getByRole('button', { name: '다음 이슈', exact: true }).click();
    assert.equal(await page.locator('#pulse-title').textContent(), briefing.issues[0].title);
    await page.screenshot({
      path: path.join(artifacts, 'issues-' + viewport.width + '.png'),
      fullPage: true,
    });
    await page
      .locator('#community-pulse')
      .screenshot({ path: path.join(artifacts, 'closeup-' + viewport.width + '.png') });
    await chart.screenshot({ path: path.join(artifacts, 'rankings-' + viewport.width + '.png') });
    if (viewport.width === 1440) {
      await page.getByRole('button', { name: '다크 모드로 전환' }).click();
      await page
        .locator('#community-pulse')
        .screenshot({ path: path.join(artifacts, 'closeup-dark.png') });
      await chart.screenshot({ path: path.join(artifacts, 'rankings-dark.png') });
    }
    await context.close();
  }
  for (const mode of ['rank-empty', 'rank-error', 'rank-current', 'rank-stale']) {
    const { page, context, rankingRequests } = await makePage({ width: 390, height: 844 }, mode);
    const chart = page.locator('#hourly-post-rankings');
    if (mode === 'rank-current') {
      await chart.getByText(/아직 시간별 기록이 쌓이지 않아 현재 순위만 표시합니다/).waitFor();
      assert.equal(await chart.locator('circle').count(), 10);
    } else if (mode === 'rank-stale') {
      await chart.getByRole('img').waitFor();
      await page.clock.fastForward(80000);
      await chart.getByRole('alert').waitFor();
      assert.ok(rankingRequests() > 1);
      assert.equal(await chart.locator('[data-rank-series]').count(), 10);
    } else {
      await chart
        .getByText(
          mode === 'rank-empty'
            ? '아직 표시할 인기글 순위가 없습니다.'
            : '인기글 순위 변화를 불러오지 못했습니다.'
        )
        .waitFor();
      assert.equal(await chart.locator('svg').count(), 0);
    }
    assert.equal(await page.locator('#today-issues article').count(), 1);
    await context.close();
  }
  for (const mode of ['empty', 'error']) {
    const { page, context } = await makePage({ width: 390, height: 844 }, mode);
    const message =
      mode === 'empty'
        ? '아직 오늘의 사회 이슈를 요약할 게시글이 없습니다.'
        : '오늘의 사회 이슈를 불러오지 못했습니다.';
    await page.locator('#today-issues').getByText(message, { exact: false }).waitFor();
    assert.equal(await page.locator('#today-issues article').count(), 0);
    assert.ok(
      (await page.locator('#popular-feed button').count()) > 0,
      'the independent popular feed remains usable'
    );
    await context.close();
  }
  for (const mode of ['refresh', 'stale']) {
    const { page, context, requests } = await makePage({ width: 390, height: 844 }, mode);
    await page.getByRole('heading', { name: briefing.issues[0].title }).waitFor();
    await page.clock.fastForward(140000);
    await page.waitForTimeout(100);
    assert.ok(requests() > 1, 'the daily briefing refreshes');
    if (mode === 'refresh')
      await page.locator('#community-pulse').getByText('360', { exact: true }).waitFor();
    else {
      await page.locator('#today-issues [role="alert"]').waitFor();
      assert.equal(
        await page.locator('#today-issues article').count(),
        1,
        'cached summaries survive a refresh error'
      );
    }
    await context.close();
  }
  const { page: autoplayPage, context: autoplayContext } = await makePage(
    { width: 1440, height: 1000 },
    'autoplay'
  );
  await autoplayPage.getByRole('heading', { name: briefing.issues[0].title }).waitFor();
  await autoplayPage.clock.fastForward(12010);
  assert.equal(await autoplayPage.locator('#pulse-title').textContent(), briefing.issues[1].title);
  await autoplayPage.locator('#daily-issue-closeup').hover();
  await autoplayPage.clock.fastForward(24010);
  assert.equal(await autoplayPage.locator('#pulse-title').textContent(), briefing.issues[1].title);
  await autoplayPage.mouse.move(0, 0);
  await autoplayPage.clock.fastForward(12010);
  assert.equal(await autoplayPage.locator('#pulse-title').textContent(), briefing.issues[2].title);
  await autoplayPage
    .getByRole('button', { name: '10위 이슈 클로즈업: ' + briefing.issues[9].title })
    .click();
  await autoplayPage.clock.fastForward(24010);
  assert.equal(await autoplayPage.locator('#pulse-title').textContent(), briefing.issues[9].title);
  await autoplayPage.getByRole('button', { name: '이슈 자동 넘김', exact: true }).click();
  await autoplayPage.mouse.move(0, 0);
  await autoplayPage.clock.fastForward(12010);
  assert.equal(await autoplayPage.locator('#pulse-title').textContent(), briefing.issues[0].title);
  await autoplayPage.getByRole('button', { name: '화면 움직임', exact: true }).click();
  await autoplayPage.getByRole('button', { name: '다음 이슈', exact: true }).click();
  assert.equal(await autoplayPage.locator('#pulse-title').textContent(), briefing.issues[1].title);
  assert.equal(
    await autoplayPage
      .locator('#daily-issue-closeup')
      .evaluate((element) => getComputedStyle(element).opacity),
    '1',
    'manual closeups stay visible with motion paused'
  );
  await autoplayContext.close();
  assert.deepEqual(errors, [], 'browser should report no uncaught errors');
  console.log(
    JSON.stringify({
      fixture: true,
      viewports: [390, 768, 1440],
      empty: true,
      error: true,
      refresh: true,
      stale: true,
      closeup: { tenTitles: true, selection: true, autoplay: true, pause: true, wrap: true },
      rankings: {
        controls: true,
        currentOnly: true,
        empty: true,
        error: true,
        stale: true,
        dark: true,
      },
      artifacts,
    })
  );
} finally {
  await browser.close();
}
