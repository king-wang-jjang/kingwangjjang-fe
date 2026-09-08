// Manual browser verification: build first; requires Playwright and Chromium.
// Reads .next output directly through request interception; opens no listening server.
// Fixture values are test-only and never enter application code.
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
const artifacts = path.join(tmpdir(), 'codex-community-pulse-review');
await mkdir(artifacts, { recursive: true });
const labels = [
  '인공지능',
  '스포츠',
  '게임',
  '경제',
  '영화',
  '음악',
  '여행',
  '생활',
  '과학',
  '음식',
  '문화',
  '건강',
  '교육',
  '자동차',
  '반려동물',
  '긴이름의커뮤니티주제',
];
const sites = ['clien', 'ruliweb', 'fmkorea', 'dcinside', 'ppomppu', 'theqoo'];
const names = ['클리앙', '루리웹', '에펨코리아', '디시인사이드', '뽐뿌', '더쿠'];
const overview = {
  generated_at: '2026-09-08T00:00:00Z',
  window_hours: 24,
  total_posts: 18542,
  total_tags: 1438,
  tags: labels.map((tag, index) => ({
    tag,
    post_count: 900 - index * 45,
    current_posts: 650 - index * 30,
    previous_posts: 250 - index * 15,
    momentum_percent: 180 - index * 13,
    impact_score: 100 - index * 4,
    share: (900 - index * 45) / 18542,
    related_tags: [labels[(index + 1) % 16], labels[(index + 3) % 16], labels[(index + 5) % 16]],
    top_sites: sites
      .slice(0, 3)
      .map((site, n) => ({
        site,
        site_label: names[n],
        post_count: Math.round((900 - index * 45) * [0.5, 0.3, 0.12][n]),
      })),
  })),
};
const posts = Array.from({ length: 10 }, (_, index) => ({
  _id: 'fixture-' + index,
  no: index + 1,
  category: 'free',
  site: sites[index % 3],
  site_label: names[index % 3],
  title: labels[index] + ' 커뮤니티에서 오늘 많이 이야기한 소식과 의견',
  url: 'https://example.com/post/' + index,
  create_time: '2026-09-08T00:00:00Z',
  tags: [labels[0], labels[index]],
  gpt_answer: '실제 API 구조를 검증하는 브라우저 테스트 전용 요약입니다.',
  contents: '브라우저 검증용 게시글',
  analysis_status: 'done',
  daily_score: 100 - index,
  native_view_count: 10000 - index * 500,
  native_like_count: index * 20,
  native_comment_count: index * 10,
}));
let liveOverview, livePosts;
const failures = [];
const report = { fixture: true, artifacts, viewports: [], errors: [], api: null };
const cacheRoot = path.join(process.env.LOCALAPPDATA || path.join(tmpdir(), '..'), 'ms-playwright');
const cachedChrome =
  process.platform === 'win32' && existsSync(cacheRoot)
    ? readdirSync(cacheRoot)
        .filter((name) => /^chromium-\d+$/.test(name))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
        .map((name) => path.join(cacheRoot, name, 'chrome-win64/chrome.exe'))
        .find(existsSync)
    : undefined;
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath:
    process.env.PULSE_CHROMIUM_PATH ||
    (existsSync(playwright.chromium.executablePath()) ? undefined : cachedChrome),
});
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const pause = (page, ms = 250) => page.waitForTimeout(ms);
async function makePage(viewport, mode = 'normal', sourceCount = 3) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push(error.message));

  if (mode !== 'intro')
    await page.addInitScript(() => {
      sessionStorage.setItem('community-pulse-intro-v3', '1');
    });
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
    if (url.pathname.includes('/boards/issues')) {
      if (mode === 'error') return json({ message: 'Fixture API unavailable' }, 500);
      if (mode === 'actual') return json(liveOverview);
      if (mode === 'empty') return json({ ...overview, tags: [], total_posts: 0, total_tags: 0 });
      const data = structuredClone(overview);
      if (mode === 'long') data.tags[0].tag = '아주긴이름의커뮤니티태그주제';
      if (sourceCount === 6)
        data.tags[0].top_sites = sites.map((site, n) => ({
          site,
          site_label: names[n],
          post_count: Math.round(900 * [0.3, 0.23, 0.17, 0.13, 0.09, 0.06][n]),
        }));
      return json(data);
    }
    if (url.pathname.includes('/boards/daily')) return json(mode === 'actual' ? livePosts : posts);
    if (url.pathname.includes('/boards/filters'))
      return json({ sites: sites.map((value, i) => ({ value, label: names[i] })) });
    if (url.hostname !== 'pulse.invalid') return json(null, 401);
    let file;
    if (url.pathname === '/') file = path.join(root, '.next/server/app/index.html');
    else if (url.pathname.startsWith('/_next/static/'))
      file = path.join(root, '.next/static', url.pathname.slice('/_next/static/'.length));
    else file = path.join(root, 'public', decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) return route.abort();
    try {
      const ext = path.extname(file);
      const type =
        {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.woff2': 'font/woff2',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        }[ext] || 'application/octet-stream';
      return route.fulfill({ contentType: type, body: await readFile(file) });
    } catch {
      return route.fulfill({ status: 404, body: '' });
    }
  });
  await page.goto('http://pulse.invalid/', { waitUntil: 'networkidle' });
  await page.locator('[data-community-story]').waitFor();
  if (['normal', 'actual', 'intro', 'long'].includes(mode) && viewport.height > 700)
    await page
      .waitForFunction(
        () => document.querySelector('[data-community-story]')?.dataset.enhanced === 'true',
        {},
        { timeout: 10000 }
      )
      .catch(async (error) => {
        await snapshot(page, 'initialization-failed');
        console.log(
          'INIT_FAILURE',
          JSON.stringify({
            errors: report.errors,
            body: await page.locator('body').innerText(),
            story: await page.locator('[data-community-story]').getAttribute('data-enhanced'),
            nodes: await page.locator('[data-topic-node]').count(),
          })
        );
        throw error;
      });
  await pause(page, 600);
  return { context, page };
}
async function progress(page, value) {
  await page.evaluate((p) => {
    const story = document.querySelector('[data-community-story]');
    const stage = story.querySelector('[data-scene]');
    const top = story.getBoundingClientRect().top + scrollY;
    const inset = parseFloat(getComputedStyle(stage).top) || 0;
    window.scrollTo({
      top: top - inset + (story.offsetHeight - stage.offsetHeight) * p,
      behavior: 'instant',
    });
  }, value);
  await pause(page);
}
async function snapshot(page, name) {
  await page.screenshot({ path: path.join(artifacts, name + '.png') });
}
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    const { page, context } = await makePage(viewport);
    const prefix = viewport.width + 'x' + viewport.height;
    await page.evaluate(() => {
      window.__pulseNode = document.querySelector('[data-topic-node]');
      window.__pulseCore = window.__pulseNode.querySelector('[data-node-core]');
    });
    const scenes = [];
    for (const [p, scene] of [
      [0, 'hero'],
      [0.2, 'particles'],
      [0.37, 'universe'],
      [0.64, 'ranking'],
      [0.82, 'featured'],
      [0.98, 'sources'],
      [0.37, 'universe'],
    ]) {
      await progress(page, p);
      const data = await page.evaluate(() => {
        const story = document.querySelector('[data-community-story]'),
          stage = story.querySelector('[data-scene]');
        const node = document.querySelector('[data-topic-node]'),
          core = node.querySelector('[data-node-core]');
        return {
          scene: stage.dataset.scene,
          identity: node === window.__pulseNode && core === window.__pulseCore,
          stageTop: stage.getBoundingClientRect().top,
          overflow: document.documentElement.scrollWidth > innerWidth,
          nodeOpacity: node.style.opacity,
          coreWidth: Number(core.getAttribute('width')),
          clickable: node.getAttribute('tabindex'),
          hitHeight: Number(node.querySelector('[data-node-hit]').getAttribute('height')),
          sourceLinks: [...document.querySelectorAll('[data-cross-stage] [data-source-link]')].map(
            (x) => ({ tab: x.tabIndex, href: x.getAttribute('href') })
          ),
          nodes: [...document.querySelectorAll('[data-topic-node]')].map((x) => ({
            transform: x.getAttribute('transform'),
            width: x.querySelector('[data-node-core]').getAttribute('width'),
            height: x.querySelector('[data-node-core]').getAttribute('height'),
            opacity: x.style.opacity,
            universe: x.querySelector('[data-universe-label]').style.opacity,
          })),
          cardOverflow: [
            ...document.querySelectorAll('[data-cross-stage] [data-source-content]'),
          ].map((x) => x.scrollHeight - x.clientHeight),
        };
      });
      scenes.push({ p, ...data });
      if (scene === 'universe' && scenes.length > 3)
        check(
          JSON.stringify(data.nodes) === JSON.stringify(scenes[2].nodes),
          prefix + ' reverse seek did not restore universe geometry'
        );
      check(data.scene === scene, prefix + ' expected ' + scene + ' got ' + data.scene);
      check(data.identity, prefix + ' persistent node was replaced');
      check(!data.overflow, prefix + ' horizontal overflow at ' + scene);
      if (scene === 'ranking') check(data.hitHeight >= 44, prefix + ' ranking tap target');
      if (scene === 'sources') {
        check(
          data.sourceLinks.every((x) => x.tab === 0 && x.href.includes('sites=')),
          prefix + ' source links not usable'
        );
        check(
          data.cardOverflow.every((x) => x <= 2),
          prefix + ' source content overflow ' + data.cardOverflow
        );
      }
      if ((viewport.width === 1440 || viewport.width === 390) && scenes.length <= 6)
        await snapshot(page, prefix + '-' + scene);
    }
    // A settings change while midway through the animation must restore semantic content.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await pause(page);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    const reduced = await page.evaluate(() => {
      const hero = document.querySelector('[data-hero]'),
        title = document.querySelector('[data-title]');
      return {
        opacity: getComputedStyle(hero).opacity,
        inert: hero.inert,
        clip: getComputedStyle(title).clipPath,
        enhanced: document.querySelector('[data-community-story]').dataset.enhanced,
      };
    });
    check(
      reduced.opacity === '1' &&
        !reduced.inert &&
        reduced.clip === 'none' &&
        reduced.enhanced === 'false',
      prefix + ' reduced motion reset ' + JSON.stringify(reduced)
    );
    report.viewports.push({ viewport, scenes, reduced });
    if (viewport.width === 1440) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await pause(page, 500);
      await progress(page, 0);
      await page.locator('a[href*="#cross-community"]').first().click();
      await pause(page, 500);
      check(
        (await page.locator('[data-source-link]').first().getAttribute('tabindex')) === '0',
        'header source jump does not expose source links'
      );
      await progress(page, 0);
      await page.locator('a[href="#popular-feed"]').first().click();
      await pause(page, 500);
      check(
        await page.locator('#popular-feed').evaluate((x) => x.getBoundingClientRect().top < 150),
        'popular skip link'
      );
      await snapshot(page, 'desktop-popular-feed');
    }
    await context.close();
  }
  for (const mode of ['reduced', 'short', 'empty', 'error']) {
    const { page, context } = await makePage(
      { width: 390, height: mode === 'short' ? 650 : 844 },
      mode
    );
    if (mode === 'error') await pause(page, 5000);
    const data = await page.evaluate(() => ({
      enhanced: document.querySelector('[data-community-story]').dataset.enhanced,
      overflow: document.documentElement.scrollWidth > innerWidth,
      heroOpacity: getComputedStyle(document.querySelector('[data-hero]')).opacity,
      rankings: document.querySelector('#all-topic-rankings')?.open,
    }));
    check(
      data.enhanced === 'false' && !data.overflow && data.heroOpacity === '1' && data.rankings,
      mode + ' fallback failed ' + JSON.stringify(data)
    );
    report.viewports.push({ mode, ...data });
    await snapshot(page, 'fallback-' + mode);
    await context.close();
  }
  for (const mode of ['long', 'intro']) {
    const sample = await makePage({ width: 390, height: 844 }, mode);
    if (mode === 'intro') {
      await pause(sample.page, 600);
      check(
        await sample.page.evaluate(
          () => sessionStorage.getItem('community-pulse-intro-v3') === '1'
        ),
        'first visit intro session marker'
      );
    }
    await progress(sample.page, 0.64);
    const labelFits = await sample.page.evaluate(() => {
      const texts = document.querySelector('[data-rank-label]').querySelectorAll('text');
      return texts[1].getBBox().x + texts[1].getComputedTextLength() < texts[3].getBBox().x;
    });
    check(labelFits, mode + ' ranking text overlaps meter');
    await progress(sample.page, 0.82);
    const featuredFits = await sample.page.evaluate(() => {
      const node = document.querySelector('[data-topic-node]');
      const rect = node.querySelector('[data-node-core]').getBoundingClientRect();
      const label = node
        .querySelector('[data-featured-label] text:nth-child(2)')
        .getBoundingClientRect();
      return label.left >= rect.left + 12 && label.right <= rect.right - 12;
    });
    check(featuredFits, mode + ' featured text exceeds card');
    await snapshot(sample.page, 'mobile-' + mode + '-featured');
    await sample.context.close();
  }
  const { page, context } = await makePage({ width: 390, height: 760 }, 'normal', 6);
  await progress(page, 0.99);
  const six = await page.evaluate(() =>
    [...document.querySelectorAll('[data-cross-stage] [data-source-content]')].map((x) => ({
      overflow: x.scrollHeight - x.clientHeight,
      bottom: x.getBoundingClientRect().bottom,
    }))
  );
  check(
    six.length === 6 && six.every((x) => x.overflow <= 2 && x.bottom <= 760),
    'six source cards overflow ' + JSON.stringify(six)
  );
  await snapshot(page, 'mobile-six-sources');
  // Smooth natural scrolling sample, recorded as a device-specific observation, not an FPS guarantee.
  await progress(page, 0.2);
  const baseline = await page.evaluate(async () => {
    let last = 0;
    const deltas = [];
    for (let i = 0; i < 100; i++) {
      const now = await new Promise(requestAnimationFrame);
      if (last) deltas.push(now - last);
      last = now;
    }
    deltas.sort((a, b) => a - b);
    return { p95ms: deltas[Math.floor(deltas.length * 0.95)], maxms: Math.max(...deltas) };
  });
  const performance = await page.evaluate(async () => {
    const story = document.querySelector('[data-community-story]'),
      stage = story.querySelector('[data-scene]');
    const top =
      story.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
    const travel = story.offsetHeight - stage.offsetHeight;
    let last = 0;
    const deltas = [];
    for (let i = 0; i < 100; i++) {
      const now = await new Promise(requestAnimationFrame);
      if (last) deltas.push(now - last);
      last = now;
      scrollTo({ top: top + travel * (0.2 + i * 0.0075), behavior: 'instant' });
    }
    deltas.sort((a, b) => a - b);
    return {
      frames: deltas.length,
      p95ms: deltas[Math.floor(deltas.length * 0.95)],
      maxms: Math.max(...deltas),
    };
  });
  report.performance = { scroll: performance, idle: baseline };
  await context.close();
  try {
    const response = await browser.newContext();
    const result = await response.request.get(
      'https://api.마약.kr/boardservice/api/boards/issues?hours=24&limit=16',
      { timeout: 15000 }
    );
    const json = await result.json();
    liveOverview = json;
    const daily = await response.request.get(
      'https://api.마약.kr/boardservice/api/boards/daily?index=0&limit=10',
      { timeout: 15000 }
    );
    livePosts = await daily.json();
    report.api = {
      status: result.status(),
      tags: json.tags?.length,
      generatedAt: json.generated_at,
      sourceCounts: json.tags?.map((x) => x.top_sites?.length),
    };
    await response.close();
    if (result.ok() && daily.ok()) {
      const actual = await makePage({ width: 1440, height: 900 }, 'actual');
      await progress(actual.page, 0.37);
      await snapshot(actual.page, 'actual-api-universe');
      await progress(actual.page, 0.98);
      await snapshot(actual.page, 'actual-api-sources');
      const overflow = await actual.page.evaluate(() =>
        [...document.querySelectorAll('[data-cross-stage] [data-source-content]')].some(
          (x) => x.scrollHeight - x.clientHeight > 2
        )
      );
      check(!overflow, 'actual API source card overflow');
      await actual.context.close();
    }
  } catch (error) {
    report.api = { unavailable: error.message };
  }
} finally {
  await browser.close();
}
check(!report.errors.length, 'Browser runtime errors: ' + report.errors.join('; '));
report.failures = failures;
await writeFile(path.join(artifacts, 'report.json'), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      artifacts,
      viewports: report.viewports.length,
      errors: report.errors,
      api: report.api,
      performance: report.performance,
      failures,
    },
    null,
    2
  )
);
assert.equal(failures.length, 0, failures.join('\n'));
