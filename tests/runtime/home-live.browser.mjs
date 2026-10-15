// Build first, then run: node tests/runtime/home-live.browser.mjs
// Board API payloads are fetched from real endpoints and saved under TEMP before
// replaying them against the local build. This verifies rendering, not live CORS.
// Optional revised API: BRIEFING_URL=http://127.0.0.1:PORT/api/boards/issues/briefing?limit=10
// Optional captured payload: BRIEFING_JSON_PATH=... and BRIEFING_PROVENANCE=...
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
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
const apiBase = process.env.LIVE_API_BASE_URL || 'https://api.xn--hz2b47s.kr';
const productionBriefingUrl = `${apiBase}/boardservice/api/boards/issues/briefing?limit=10`;
const artifacts =
  process.env.HOME_LIVE_ARTIFACTS ||
  path.join(tmpdir(), 'codex-home-live-review', new Date().toISOString().replaceAll(':', '-'));
const snapshots = [];
const checks = [];
const unmet = [];
const pageErrors = [];
const requestFailures = [];
const expectedReplayPrefetchAborts = [];
const requests = [];
await mkdir(artifacts, { recursive: true });
assert.ok(existsSync(path.join(root, '.next/server/app/index.html')), 'Run npm run build first.');

async function fetchSnapshot(name, url) {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(60_000),
  });
  assert.ok(response.ok, `${name}: ${response.status} from ${url}`);
  const data = await response.json();
  const provenance = {
    name,
    sourceUrl: url,
    fetchedAt: new Date().toISOString(),
    status: response.status,
    serverDate: response.headers.get('date'),
    generatedAt: data?.generated_at,
    dataDate: data?.date,
    issueCount: data?.issues?.length,
    path: path.join(artifacts, `${name}.json`),
  };
  snapshots.push(provenance);
  await writeFile(provenance.path, JSON.stringify(data, null, 2));
  return data;
}

const apiSnapshots = new Map();
const boardPath = '/boardservice/api/boards';
const sourceEntries = await Promise.all([
  fetchSnapshot('production-briefing', productionBriefingUrl),
  fetchSnapshot('daily', `${apiBase}${boardPath}/daily?index=0&limit=10`),
  fetchSnapshot('realtime', `${apiBase}${boardPath}/realtime?index=0&limit=100`),
  fetchSnapshot('hourly-rankings', `${apiBase}${boardPath}/daily/hourly-rankings?hours=24`),
]);
const [productionBriefing, daily, realtime, timeline] = sourceEntries;
apiSnapshots.set(`${boardPath}/daily?index=0&limit=10`, daily);
apiSnapshots.set(`${boardPath}/realtime?index=0&limit=100`, realtime);
apiSnapshots.set(`${boardPath}/daily/hourly-rankings?hours=24`, timeline);
let briefing = productionBriefing;
if (process.env.BRIEFING_JSON_PATH) {
  assert.ok(
    process.env.BRIEFING_PROVENANCE,
    'BRIEFING_JSON_PATH requires BRIEFING_PROVENANCE describing its actual data source.'
  );
  briefing = JSON.parse(await readFile(process.env.BRIEFING_JSON_PATH, 'utf8'));
  snapshots.push({
    name: 'selected-briefing',
    sourceFile: path.resolve(process.env.BRIEFING_JSON_PATH),
    provenance: process.env.BRIEFING_PROVENANCE,
    generatedAt: briefing.generated_at,
    path: path.join(artifacts, 'selected-briefing.json'),
  });
  await writeFile(path.join(artifacts, 'selected-briefing.json'), JSON.stringify(briefing, null, 2));
} else if (process.env.BRIEFING_URL) {
  briefing = await fetchSnapshot('selected-briefing', process.env.BRIEFING_URL);
}

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

async function makePage(viewport, selectedBriefing) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.clock.install();
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const url = new URL(request.url());
    const failure = { url: request.url(), error: request.failure()?.errorText };
    const isLocalReplayPrefetchAbort =
      url.hostname === 'home-live.invalid' &&
      /^\/(?:board|top10)\/?$/.test(url.pathname) &&
      url.searchParams.has('_rsc') &&
      request.method() === 'GET' &&
      !request.isNavigationRequest() &&
      failure.error === 'net::ERR_ABORTED';
    if (isLocalReplayPrefetchAbort) {
      expectedReplayPrefetchAborts.push({
        ...failure,
        reason: 'Next.js route prefetch was canceled during static home replay; destination routes are not served.',
        nextRouterPrefetch: request.headers()['next-router-prefetch'],
      });
    } else {
      requestFailures.push(failure);
    }
  });
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
        headers: {
          'access-control-allow-origin': 'http://home-live.invalid',
          'access-control-allow-credentials': 'true',
        },
      });
    if (url.pathname.startsWith(boardPath)) {
      const key = url.pathname + url.search;
      requests.push(key);
      if (url.pathname === `${boardPath}/issues/briefing`) return json(selectedBriefing);
      if (!apiSnapshots.has(key)) {
        apiSnapshots.set(key, await fetchSnapshot(`api-extra-${apiSnapshots.size}`, apiBase + key));
      }
      return json(apiSnapshots.get(key));
    }
    // Logged-out auth only; no board data is synthesized by this stub.
    if (url.pathname.startsWith('/userservice/')) return json(null, 401);
    if (url.hostname !== 'home-live.invalid') return route.fulfill({ status: 404, body: '' });
    let file;
    if (url.pathname === '/') file = path.join(root, '.next/server/app/index.html');
    else if (url.pathname.startsWith('/_next/static/'))
      file = path.join(root, '.next/static', url.pathname.slice('/_next/static/'.length));
    else file = path.join(root, 'public', decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) return route.abort();
    const contentType =
      {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.woff2': 'font/woff2',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
      }[path.extname(file)] || 'application/octet-stream';
    try {
      return route.fulfill({ contentType, body: await readFile(file) });
    } catch {
      return route.fulfill({ status: 404, body: '' });
    }
  });
  await page.goto('http://home-live.invalid/', { waitUntil: 'networkidle' });
  await page.locator('[data-ascii-home]').waitFor();
  return { page, context };
}

async function verifyLogo(page, label) {
  const logo = page.locator('[data-ascii-logo]');
  await logo.waitFor({ state: 'visible' });
  await logo.scrollIntoViewIfNeeded();
  assert.equal(await logo.count(), 1, `${label}: exactly one original ASCII logo`);
  const frame = logo.locator('[data-logo-frame]');
  assert.ok((await frame.textContent()).trim().length > 100);
  const bounds = await logo.boundingBox();
  const frameBounds = await frame.boundingBox();
  assert.ok(bounds && bounds.width > 0 && bounds.height > 0, `${label}: logo has visible dimensions`);
  assert.ok(
    frameBounds &&
      frameBounds.x >= bounds.x - 1 &&
      frameBounds.y >= bounds.y - 1 &&
      frameBounds.x + frameBounds.width <= bounds.x + bounds.width + 1 &&
      frameBounds.y + frameBounds.height <= bounds.y + bounds.height + 1,
    `${label}: full ASCII frame must fit inside logo without clipping: ${JSON.stringify({ bounds, frameBounds })}`
  );
  await page.waitForFunction(
    () => document.querySelector('[data-ascii-logo]')?.getAttribute('data-animating') === 'true'
  );
  const beforeAnimation = await frame.textContent();
  await page.clock.runFor(600);
  assert.notEqual(await frame.textContent(), beforeAnimation, `${label}: visible logo animates`);

  const motion = page.getByRole('button', { name: '화면 움직임', exact: true });
  await motion.click();
  assert.equal(await motion.getAttribute('aria-pressed'), 'false');
  const pausedFrame = await frame.textContent();
  await page.clock.runFor(300);
  assert.equal(await frame.textContent(), pausedFrame, `${label}: paused logo frame remains stable`);
  assert.ok(await logo.isVisible(), `${label}: paused logo stays visible`);
  await motion.click();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(
    () => document.querySelector('[data-home-motion]')?.getAttribute('data-home-motion') === 'paused'
  );
  const reducedFrame = await frame.textContent();
  await page.clock.runFor(300);
  assert.equal(await frame.textContent(), reducedFrame, `${label}: reduced motion keeps logo stable`);
  assert.ok(await logo.isVisible(), `${label}: reduced motion keeps logo visible`);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(
    () => document.querySelector('[data-home-motion]')?.getAttribute('data-home-motion') === 'running'
  );
  checks.push({ label, logoVisible: true, fullFrameFits: true, animation: true, pause: true, reducedMotion: true });
}

async function verifyCloseup(page, data, label) {
  const issues = data.issues.slice(0, 10);
  if (!issues.length) {
    assert.equal(await page.locator('#today-issues article').count(), 0);
    checks.push(`${label}: real empty briefing keeps logo and empty state`);
    return false;
  }
  await page.locator('#daily-issue-closeup').waitFor();
  assert.equal(await page.locator('#today-issues ol > li').count(), issues.length);
  for (const [index, issue] of issues.entries()) {
    await page
      .getByRole('button', { name: `${index + 1}위 이슈 클로즈업: ${issue.title}`, exact: true })
      .click();
    assert.equal(await page.locator('#pulse-title').textContent(), issue.title);
    const summarySource = issue.summary_source || (issue.summary?.trim() ? 'ai' : 'pending');
    assert.equal(
      await page.locator('#daily-issue-closeup').getAttribute('data-summary-source'),
      summarySource
    );
    if (issue.summary?.trim()) {
      assert.equal(
        await page.locator('#daily-issue-closeup').getByText(issue.summary, { exact: true }).count(),
        1,
        `${label}: actual summary for ${issue.title}`
      );
    } else {
      assert.equal(
        await page
          .locator('#daily-issue-closeup')
          .getByText('아직 AI 요약이 준비되지 않았습니다. 아래 관련 원문에서 내용을 확인할 수 있습니다.', {
            exact: true,
          })
          .count(),
        1,
        `${label}: genuine unavailable summary is labeled honestly`
      );
    }
    const sourcePosts = issue.posts.filter((post) => /^https?:\/\//i.test(post.url));
    if (sourcePosts.length) {
      const details = page.locator('#daily-issue-closeup details');
      await details.locator('summary').click();
      const hrefs = await details.locator('a').evaluateAll((links) => links.map((link) => link.href));
      for (const post of sourcePosts) assert.ok(hrefs.includes(new URL(post.url).href));
    }
  }
  if (issues.length > 1) {
    const play = page.getByRole('button', { name: '이슈 자동 넘김', exact: true });
    await play.click();
    await page.mouse.move(0, 0);
    await page.clock.fastForward(12_010);
    assert.equal(await page.locator('#pulse-title').textContent(), issues[0].title);
  }
  checks.push(`${label}: all ${issues.length} actual titles, summaries, source links and selection`);
  return true;
}

async function verifyRankings(page, label) {
  const chart = page.locator('#hourly-post-rankings');
  const buckets = timeline.rankings
    .filter((bucket) => Number.isFinite(Date.parse(bucket.started_at)))
    .sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at))
    .slice(-24);
  const latestIds = new Set(buckets.at(-1)?.posts.map((post) => post.board_id));
  const slider = chart.getByRole('slider');
  await slider.waitFor();
  await slider.focus();
  await slider.press('Home');
  let historicalOnlyTitles = 0;
  let emptyBuckets = 0;
  for (const [index, bucket] of buckets.entries()) {
    if (index > 0) await slider.press('ArrowRight');
    assert.equal(await slider.inputValue(), String(index));
    assert.equal(await chart.locator('time').getAttribute('datetime'), bucket.started_at);
    const expected = bucket.posts.toSorted((a, b) => a.rank - b.rank).slice(0, 10);
    const rows = chart.locator('ul[aria-label="선택한 시간의 인기글 순위"] > li');
    assert.equal(await rows.count(), expected.length, `${label}: rows at ${bucket.started_at}`);
    for (const [postIndex, post] of expected.entries()) {
      const row = rows.nth(postIndex);
      assert.equal(await row.locator('strong').textContent(), post.title);
      assert.ok((await row.innerText()).includes(`${post.site_label} / ${post.rank}위`));
      const href = /^https?:\/\//i.test(post.url) ? new URL(post.url).href : null;
      assert.equal(await row.locator('a').getAttribute('href'), href);
      if (!latestIds.has(post.board_id)) historicalOnlyTitles += 1;
    }
    if (!expected.length) emptyBuckets += 1;
  }
  assert.ok(historicalOnlyTitles > 0, `${label}: live timeline must contain a historical-only title`);
  checks.push({
    label,
    rankingBucketsVerified: buckets.length,
    historicalOnlyTitlesVerified: historicalOnlyTitles,
    realEmptyBucketsVerified: emptyBuckets,
    emptyBucketCoverage: emptyBuckets ? 'verified from real response' : 'not present in real response',
  });
}

let failure;
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const label = `${viewport.width}px`;
    const { page, context } = await makePage(viewport, briefing);
    try {
      await verifyLogo(page, label);
      const hasIssues = await verifyCloseup(page, briefing, label);
      if (!hasIssues) unmet.push(`${label}: real briefing is empty; closeup behavior remains unverified`);
      await verifyRankings(page, label);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
        false,
        `${label}: no horizontal overflow`
      );
      await page.screenshot({ path: path.join(artifacts, `home-${viewport.width}.png`), fullPage: true });
      await page.locator('#community-pulse').screenshot({
        path: path.join(artifacts, `closeup-${viewport.width}.png`),
      });
      await page.locator('#hourly-post-rankings').screenshot({
        path: path.join(artifacts, `rankings-${viewport.width}.png`),
      });
    } finally {
      await context.close();
    }
  }
  // The empty payload is a separate, unchanged actual production response.
  if (productionBriefing.issues.length === 0 && briefing !== productionBriefing) {
    const { page, context } = await makePage({ width: 390, height: 844 }, productionBriefing);
    try {
      await verifyLogo(page, 'production-empty');
      await verifyCloseup(page, productionBriefing, 'production-empty');
      await page.locator('#community-pulse').screenshot({
        path: path.join(artifacts, 'actual-production-empty.png'),
      });
    } finally {
      await context.close();
    }
  }
  assert.deepEqual(pageErrors, [], 'no uncaught browser errors');
  assert.deepEqual(requestFailures, [], 'no failed browser requests');
} catch (error) {
  failure = error.stack || error.message;
  process.exitCode = 1;
} finally {
  await browser.close();
}

const report = {
  passed: !failure && unmet.length === 0,
  artifactMode: 'local production build with unchanged real API response replay',
  liveCorsVerified: false,
  replayLimitations: [
    'The static replay serves the home page only; board/top10 RSC prefetch aborts are recorded separately. Destination navigation is not verified.',
    'Only GET, non-navigation, home-live.invalid /board or /top10 requests with _rsc and net::ERR_ABORTED qualify as expected replay aborts. API, asset and navigation failures remain failures.',
  ],
  ancillaryAuthStub: 'logged out; board responses are real snapshots',
  syntheticBoardFixtures: false,
  artifacts,
  snapshots,
  checks,
  unmet,
  pageErrors,
  requestFailures,
  expectedReplayPrefetchAborts,
  requests,
  failure,
};
await writeFile(path.join(artifacts, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (unmet.length && !process.exitCode) process.exitCode = 2;
