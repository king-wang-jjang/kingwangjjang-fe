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
const artifacts = path.join(tmpdir(), 'codex-home-hourly-review');
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
  hourly_rankings: Array.from({ length: 24 }, (_, hour) => ({
    started_at: new Date(Date.UTC(2026, 8, 7, hour + 1)).toISOString(),
    tags:
      hour === 9
        ? []
        : Array.from({ length: 10 }, (_, index) => ({
            tag: labels[(index + Math.floor(hour / 4)) % 10],
            rank: index + 1,
            post_count: 100 - index * 8 + hour,
          })),
  })),
  tags: labels.map((tag, index) => ({
    tag,
    post_count: 900 - index * 45,
    current_posts: 650 - index * 30,
    previous_posts: 250 - index * 15,
    momentum_percent: 180 - index * 13,
    impact_score: 100 - index * 4,
    share: (900 - index * 45) / 18542,
    related_tags: [labels[(index + 1) % 16], labels[(index + 3) % 16], labels[(index + 5) % 16]],
    top_sites: sites.slice(0, 3).map((site, n) => ({
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
const report = {
  fixture: true,
  artifacts,
  viewports: [],
  motion: [],
  refresh: [],
  errors: [],
  api: null,
};
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

async function makePage(viewport, mode = 'normal', sourceCount = 3) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: mode === 'reduced' || mode === 'refresh' ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  if (mode === 'refresh') await page.clock.install();
  page.on('pageerror', (error) => report.errors.push(error.message));
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
      if (mode === 'empty')
        return json({ ...overview, tags: [], hourly_rankings: [], total_posts: 0, total_tags: 0 });
      const data = structuredClone(overview);
      if (mode === 'long') {
        data.tags[0].tag = '아주긴이름의커뮤니티태그주제';
        data.hourly_rankings.forEach((bucket) =>
          bucket.tags.forEach((tag) => {
            if (tag.tag === labels[0]) tag.tag = data.tags[0].tag;
          })
        );
      }
      if (sourceCount === 6)
        data.tags[0].top_sites = sites.map((site, n) => ({
          site,
          site_label: names[n],
          post_count: Math.round(900 * [0.3, 0.23, 0.17, 0.13, 0.09, 0.06][n]),
        }));
      return json(data);
    }
    if (url.pathname.includes('/boards/daily')) {
      if (mode === 'error') return json({ message: 'Fixture API unavailable' }, 500);
      if (mode === 'refresh')
        return json(posts.map((post) => ({ ...post, analysis_status: 'processing' })));
      return json(mode === 'actual' ? livePosts : mode === 'empty' ? [] : posts);
    }
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

  // Streaming HTML can briefly contain a hidden copy before hydration finishes.
  await page.waitForFunction(() => document.querySelectorAll('[data-ascii-home]').length === 1);
  await page.locator('[data-ascii-home]').waitFor();
  await page.waitForTimeout(mode === 'error' ? 4000 : 200);
  return { page, context };
}
async function screenshot(page, name) {
  await page.screenshot({ path: path.join(artifacts, name + '.png') });
  await page.screenshot({ path: path.join(artifacts, name + '-full.png'), fullPage: true });
  await page
    .locator('#hourly-tag-rankings')
    .screenshot({ path: path.join(artifacts, name + '-hourly.png') });
  await page
    .locator('#tag-rankings')
    .screenshot({ path: path.join(artifacts, name + '-tags.png') });
  await page
    .locator('#popular-feed')
    .screenshot({ path: path.join(artifacts, name + '-feed.png') });
}
async function inspect(page, label) {
  await page.evaluate(() => scrollTo(0, 0));
  const result = await page.evaluate(() => {
    const main = document.querySelector('main');
    const visible = (el) =>
      !!(el.getBoundingClientRect().width && el.getBoundingClientRect().height);
    const contents = [
      document.querySelector('[data-home-text-header]') || document.querySelector('header'),
      main,
    ].filter(Boolean);
    const graphics = contents
      .flatMap((x) => [...x.querySelectorAll('svg,img,canvas,video')])
      .filter((el) => !el.matches('#hourly-tag-rankings svg'))
      .filter(visible).length;
    const fixed = contents
      .flatMap((x) => [x, ...x.querySelectorAll('*')])
      .filter((x) => ['fixed', 'sticky'].includes(getComputedStyle(x).position)).length;
    const logo = document.querySelector('[data-ascii-logo]');
    const logoFrame = logo?.querySelector('[data-logo-frame]');
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      graphics,
      logoText: logoFrame?.textContent,
      logoAlt: logo?.getAttribute('aria-label'),
      logoRole: logo?.getAttribute('role'),
      logoTextHidden: logoFrame?.parentElement.getAttribute('aria-hidden') === 'true',
      logoAspectRatio: logo ? logo.clientWidth / logo.clientHeight : 0,
      sculptureCount: document.querySelectorAll('[data-ascii-live], [data-ascii-flow="signal"]')
        .length,
      fixed,
      font: getComputedStyle(main).fontFamily,
      tags: document.querySelectorAll('[data-topic-node]').length,
      sources: [...document.querySelectorAll('[data-source-link]')].map((x) =>
        x.getAttribute('href')
      ),
      titleSize: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      headings: [...main.querySelectorAll('h1, h2')].map((el) => ({
        text: el.textContent,
        weight: Number(getComputedStyle(el).fontWeight),
      })),
      sections: ['tag-rankings', 'cross-community', 'popular-feed'].map((id) => ({
        id,
        height: Math.ceil(document.getElementById(id).getBoundingClientRect().height),
      })),
      viewportHeight: innerHeight,
      postRows: document.querySelectorAll('#trending-post-list > li').length,
      hasPreview: !!document.querySelector('#trending-post-preview'),
      destinations: ['/board', '/top10'].map((href) => {
        const link = [...document.querySelectorAll('[data-home-text-header] a')].find(
          (el) => new URL(el.href).pathname.replace(/\/$/, '') === href
        );
        const rect = link?.getBoundingClientRect();
        return { href, visible: !!rect && rect.top >= 0 && rect.bottom <= innerHeight };
      }),
      text: main.innerText,
    };
  });
  check(!result.overflow, label + ' horizontal overflow');
  check(
    result.graphics === 0 && /^[\x20-\x7e\n]+$/.test(result.logoText ?? ''),
    label + ' logo should be ASCII text without image assets'
  );
  check(
    result.logoRole === 'img' &&
      result.logoAlt?.includes('마약 프로젝트 ASCII 로고') &&
      result.logoTextHidden,
    label + ' logo missing accessible text or exposing raw characters'
  );
  const logoRows = result.logoText?.split('\n') ?? [];
  check(
    logoRows.length === 36 && logoRows.every((row) => row.length === 72),
    label + ' logo should preserve its 72-column, 36-row proportions'
  );
  check(
    new Set(result.logoText.replace(/\s/g, '')).size >= 3,
    label + ' 3D logo missing lighting shades'
  );
  check(Math.abs(result.logoAspectRatio - 1) < 0.05, label + ' logo is distorted');
  check(result.sculptureCount === 0, label + ' old interactive sculpture remains');
  check(result.fixed === 0, label + ' fixed/sticky elements remain');
  check(result.titleSize <= 20, label + ' oversized title');
  check(
    result.headings.every((heading) => heading.weight >= 700),
    label + ' weak heading emphasis'
  );
  check(
    result.destinations.every((link) => link.visible),
    label + ' missing first-screen destination'
  );
  if (!result.hasPreview) {
    for (const section of result.sections) {
      check(
        section.height <= result.viewportHeight - 16,
        label + ' section too tall: ' + section.id + ' (' + section.height + 'px)'
      );
    }
  }
  check(/mono|Consolas|D2Coding/i.test(result.font), label + ' missing mono font');
  if (label !== 'actual API')
    check(!/[█░▒▓●◉•→↗↓]/.test(result.text), label + ' non-ASCII decoration remains');
  report.viewports.push({ label, ...result, text: undefined });
  return result;
}
async function inspectHourlyChart(page, label) {
  const chart = page.locator('#hourly-tag-rankings');
  const slider = chart.getByRole('slider', { name: '순위를 확인할 시간' });
  check((await chart.getByRole('img').count()) === 1, label + ' missing hourly rank graph');
  check(
    (await chart.locator('[data-rank-series]').count()) === 5,
    label + ' missing default tag series'
  );
  for (const hours of [6, 12, 24]) {
    await chart.getByRole('button', { name: `[${hours}시간]`, exact: true }).click();
    check(
      (await slider.getAttribute('max')) === String(hours - 1),
      label + ' wrong hourly range ' + hours
    );
  }
  await chart.getByRole('combobox', { name: '비교 태그' }).selectOption(labels[0]);
  check(
    (await chart.locator('[data-rank-series]').count()) === 1,
    label + ' tag filter did not select one series'
  );
  await slider.focus();
  await slider.press('Home');
  await slider.press('ArrowRight');
  check((await slider.inputValue()) === '1', label + ' keyboard hour selection failed');
  check(
    (await chart.locator('time').getAttribute('datetime')) ===
      overview.hourly_rankings[1].started_at,
    label + ' selected hour timestamp mismatch'
  );
  const entry = overview.hourly_rankings[1].tags.find((tag) => tag.tag === labels[0]);
  check(
    (await chart.getByText(`${entry.rank}위 / ${entry.post_count}개`, { exact: true }).count()) ===
      1,
    label + ' selected hour rank/count mismatch'
  );
  const tagLink = chart.getByRole('link', { name: `#${labels[0]}`, exact: true });
  const tagUrl = new URL(await tagLink.getAttribute('href'), page.url());
  check(
    tagUrl.pathname === '/board' && tagUrl.searchParams.get('tag') === labels[0],
    label + ' hourly tag link did not target the matching board filter'
  );
  await chart.getByRole('combobox', { name: '비교 태그' }).selectOption('');
  check(
    (await chart.locator('[data-rank-series]').count()) === 5,
    label + ' default comparison did not restore'
  );
  await slider.focus();
  await slider.press('End');
  await page.evaluate(() => scrollTo(0, 0));
}
async function inspectMotion(page, label, shouldMove) {
  const sample = () =>
    page.evaluate(() => {
      const home = document.querySelector('[data-home-motion]');
      const logo = document.querySelector('[data-ascii-logo]');
      const logoBounds = logo.getBoundingClientRect();
      return {
        tracks: [...document.querySelectorAll('[data-ascii-track]')].map((track) => ({
          flow: track.closest('[data-ascii-flow]')?.getAttribute('data-ascii-flow'),
          transform: getComputedStyle(track).transform,
          is2D: new DOMMatrix(getComputedStyle(track).transform).is2D,
          shape: track.getAttribute('data-ascii-object'),
          text: track.textContent,
        })),
        running: home
          ? home
              .getAnimations({ subtree: true })
              .filter((animation) => animation.playState === 'running').length
          : 0,
        decorations: [...document.querySelectorAll('[data-ascii-flow]')].map((flow) => ({
          kind: flow.getAttribute('data-ascii-flow'),
          hidden: flow.getAttribute('aria-hidden') === 'true',
          pointerEvents: getComputedStyle(flow).pointerEvents,
        })),
        logoTransform: getComputedStyle(logo.querySelector('[data-logo-frame]')).transform,
        logoText: logo.querySelector('[data-logo-frame]').textContent,
        logoInView: logoBounds.bottom > 0 && logoBounds.top < innerHeight,
        logoRunning: logo.dataset.animating === 'true',
        ambientRunning:
          document.querySelector('[data-ascii-flow="ambient"]')?.getAttribute('data-animating') ===
          'true',
        overflow: document.documentElement.scrollWidth > innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        rankingsTop: document.getElementById('tag-rankings').getBoundingClientRect().top,
      };
    });
  // Allow the media query or pause control to settle before comparing frames.
  await page.waitForTimeout(300);
  const before = await sample();
  await page.waitForTimeout(450);
  const after = await sample();
  const moved = after.tracks.filter(
    (track, index) => track.transform !== before.tracks[index]?.transform
  );
  const charactersChanged = after.tracks.some(
    (track, index) => track.text !== before.tracks[index]?.text
  );
  check(after.tracks.length >= 162, label + ' too few floating shapes');
  check(
    after.tracks.every((track) => track.is2D),
    label + ' background still uses 3D transforms'
  );
  check(!charactersChanged, label + ' filled shapes should not be redrawn or shaded');
  check(
    before.logoTransform === 'none' && after.logoTransform === 'none',
    label + ' logo should render 3D into text'
  );
  if (shouldMove && after.logoInView) {
    check(
      after.logoRunning && before.logoText !== after.logoText,
      label + ' 3D ASCII logo did not redraw its geometry and shading'
    );
  } else {
    check(
      !after.logoRunning && before.logoText === after.logoText,
      label + ' ASCII logo continued moving'
    );
  }
  for (const shape of ['square', 'circle', 'triangle']) {
    check(
      after.tracks.some((track) => track.shape === shape && /^[\x20-\x7e\n]+$/.test(track.text)),
      label + ' missing flat ASCII shape: ' + shape
    );
  }
  for (const kind of ['ambient']) {
    const decoration = after.decorations.find((flow) => flow.kind === kind);
    check(decoration?.hidden, label + ' ' + kind + ' is exposed to assistive technology');
    check(
      decoration?.pointerEvents === 'none',
      label + ' ' + kind + ' may intercept pointer input'
    );
  }
  if (shouldMove) {
    check(
      moved.some((track) => track.flow === 'ambient'),
      label + ' ambient flow did not move'
    );
    check(after.ambientRunning, label + ' missing background animation');
  } else {
    check(moved.length === 0, label + ' ASCII tracks continued moving');
    check(after.running === 0, label + ' home animations continued running');
    check(!after.ambientRunning, label + ' background shapes continued animating');
  }
  check(!before.overflow && !after.overflow, label + ' motion caused horizontal overflow');
  check(before.pageHeight === after.pageHeight, label + ' motion changed the page height');
  check(before.rankingsTop === after.rankingsTop, label + ' motion moved the rankings');
  report.motion.push({
    label,
    tracks: after.tracks.length,
    moved: moved.length,
    running: after.running,
    logoRunning: after.logoRunning,
    logoCharactersChanged: before.logoText !== after.logoText,
    charactersChanged,
  });
}

async function inspectLogoPointer(page, label, enabled) {
  await page.evaluate(() => scrollTo(0, 0));
  const header = page.locator('[data-ascii-home] > header');
  const bounds = await header.boundingBox();
  const sample = () => page.locator('[data-logo-frame]').textContent();
  await page.mouse.move(bounds.x + bounds.width * 0.15, bounds.y + 25);
  await page.waitForTimeout(300);
  const left = await sample();
  await page.mouse.move(bounds.x + bounds.width * 0.85, bounds.y + 25);
  await page.waitForTimeout(300);
  const right = await sample();
  check(enabled ? left !== right : left === right, label + ' logo pointer response incorrect');
  // The clock-controlled unit test isolates pointer tilt from automatic rotation
  // and checks touch input plus return to the original orientation.
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
}

async function inspectRefresh(viewport) {
  const { page, context } = await makePage(viewport, 'refresh');
  try {
    await page.getByRole('button', { name: /2위.*스포츠.*미리보기/ }).click();
    await page.evaluate(() => scrollBy(0, 80));
    const sample = () =>
      page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        scrollY,
        sections: ['tag-rankings', 'cross-community', 'popular-feed', 'trending-post-preview'].map(
          (id) => {
            const bounds = document.getElementById(id).getBoundingClientRect();
            return { id, top: bounds.top, height: bounds.height };
          }
        ),
      }));
    const before = await sample();
    const assertStable = async (state) => {
      const after = await sample();
      check(
        JSON.stringify(before) === JSON.stringify(after),
        `${viewport.width}px ${state} moved the page`
      );
      check(
        await page.locator('#trending-post-preview').isVisible(),
        `${state} closed the selected preview`
      );
      report.refresh.push({ width: viewport.width, state, before, after });
    };
    const pending = [];
    await page.route('**/boards/**', (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname.includes('/boards/issues') || pathname.includes('/boards/daily'))
        pending.push(route);
      else return route.fallback();
    });
    const settle = async (status = 200) => {
      check(pending.length === 2, 'both home queries should refresh');
      await Promise.all(
        pending.splice(0).map((route) =>
          route.fulfill({
            status,
            contentType: 'application/json',
            headers: {
              'access-control-allow-origin': 'http://pulse.invalid',
              'access-control-allow-credentials': 'true',
            },
            body: JSON.stringify(
              status !== 200
                ? { message: 'Refresh unavailable' }
                : route.request().url().includes('/boards/issues')
                  ? { ...overview, total_posts: 18543 }
                  : posts.map((post) => ({
                      ...post,
                      analysis_status: 'processing',
                      native_view_count: 12000,
                    }))
            ),
          })
        )
      );
      await page.waitForTimeout(100);
    };
    for (const outcome of ['success', 'error', 'recovered']) {
      await page.clock.fastForward(120_001);
      await page.locator('#popular-feed [aria-busy="true"]').waitFor();
      await page.waitForTimeout(100);
      await assertStable(`${outcome}: refreshing`);
      await settle(outcome === 'error' ? 500 : 200);
      if (outcome === 'error') {
        await page.clock.fastForward(1_001);
        await page.waitForTimeout(100);
        await settle(500);
        await page.locator('#popular-feed [role="alert"]').waitFor();
        await page.locator('#tag-rankings [role="alert"]').waitFor();
      } else {
        await page.locator('#popular-feed [aria-busy="false"]').waitFor();
        check(
          (await page.locator('#community-pulse header').innerText()).includes('18,543'),
          'updated data was not displayed'
        );
      }
      await assertStable(outcome);
    }
  } finally {
    await context.close();
  }
}

async function inspectHighlight(page, label) {
  const selectedTitle = page.locator('#trending-post-list button[aria-expanded="true"] strong');
  const styles = await selectedTitle.evaluate((el) => ({
    background: getComputedStyle(el).backgroundImage,
    decoration: getComputedStyle(el).textDecorationLine,
  }));
  check(
    styles.background.includes('linear-gradient'),
    label + ' selected title missing highlighter'
  );
  check(styles.decoration === 'none', label + ' selected title is underlined');
  check(
    (await page.locator('#trending-post-preview > p[aria-hidden="true"]').count()) === 0,
    label + ' selected preview still adds a separator'
  );
  const mode = await page.locator('#popular-feed button[aria-pressed="true"]').evaluate((el) => ({
    background: getComputedStyle(el).backgroundImage,
    decoration: getComputedStyle(el).textDecorationLine,
  }));
  check(
    mode.background.includes('linear-gradient') && mode.decoration === 'none',
    label + ' sort mode missing highlighter'
  );
}

try {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 2560, height: 1080 },
  ]) {
    const { page, context } = await makePage(viewport);
    const label = viewport.width + 'x' + viewport.height;
    await inspect(page, label);
    await inspectHourlyChart(page, label);
    check((await page.locator('[data-topic-node]').count()) === 16, label + ' missing tag rows');
    check(
      (await page.locator('#trending-post-list > li').count()) === 10,
      label + ' missing popular titles'
    );
    check(
      (await page.locator('#trending-post-preview').count()) === 0,
      label + ' preview should start closed'
    );
    check(
      (await page.locator('[data-source-link]').first().getAttribute('href')).includes('sites='),
      label + ' missing source filter'
    );
    await page.getByRole('button', { name: '반응', exact: true }).click();
    const firstDetail = page.locator('#trending-post-list a').first();
    check(
      (await firstDetail.getAttribute('href')).includes('rank=1'),
      label + ' original rank lost'
    );
    await page.getByRole('button', { name: /2위.*스포츠.*미리보기/ }).click();
    await page.mouse.move(0, 0);
    await inspectHighlight(page, label);
    check(
      (
        await page
          .getByRole('link', { name: '2위 글 자세히 보기', exact: true })
          .getAttribute('href')
      ).includes('rank=2'),
      label + ' preview link lost'
    );
    if (viewport.width === 390) {
      await page
        .locator('#trending-post-preview')
        .screenshot({ path: path.join(artifacts, 'selected-preview.png') });
    }
    await page.getByRole('button', { name: /2위.*스포츠.*미리보기/ }).click();
    check(
      (await page.locator('#trending-post-preview').count()) === 0,
      label + ' preview did not close'
    );
    await page.getByRole('button', { name: '인기', exact: true }).click();
    await page.evaluate(() => scrollTo(0, 0));
    await screenshot(page, label);
    if (viewport.width === 390) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await inspect(page, 'reduced after load');
      await inspectMotion(page, 'reduced after load', false);
      await inspectLogoPointer(page, 'reduced after load', false);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await inspectMotion(page, 'motion preference restored', true);
    }
    await page.evaluate(() => scrollTo(0, 0));
    if (viewport.width === 1440) {
      const motionToggle = page.getByRole('button', { name: '화면 움직임', exact: true });
      check(
        (await motionToggle.getAttribute('aria-pressed')) === 'true' &&
          (await page.locator('[data-home-motion]').getAttribute('data-home-motion')) === 'running',
        'motion control should initially indicate running'
      );
      await inspectMotion(page, 'normal motion', true);
      await inspectLogoPointer(page, 'normal motion', true);
      await motionToggle.click();
      check(
        (await motionToggle.getAttribute('aria-pressed')) === 'false' &&
          (await motionToggle.innerText()) === '[움직임 꺼짐]' &&
          (await page.locator('[data-home-motion]').getAttribute('data-home-motion')) === 'paused',
        'motion control did not indicate paused'
      );
      await inspectMotion(page, 'user paused', false);
      await inspectLogoPointer(page, 'user paused', false);
      await motionToggle.click();
      check(
        (await motionToggle.getAttribute('aria-pressed')) === 'true' &&
          (await motionToggle.innerText()) === '[움직임 켜짐]' &&
          (await page.locator('[data-home-motion]').getAttribute('data-home-motion')) === 'running',
        'motion control did not indicate resumed'
      );
      await inspectMotion(page, 'user resumed', true);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await inspectMotion(page, 'background while reading the feed', true);
      await page.evaluate(() => scrollTo(0, 0));
    }
    if (viewport.width === 2560) await inspectMotion(page, 'ultrawide motion', true);
    await context.close();
  }
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await inspectRefresh(viewport);
  }
  for (const mode of ['empty', 'error', 'long', 'reduced']) {
    const { page, context } = await makePage({ width: 390, height: 650 }, mode, 6);
    await inspect(page, mode);
    if (mode === 'reduced') await inspectMotion(page, 'reduced on initial load', false);
    check(
      (await page
        .locator('#popular-feed a[href="/top10"], #popular-feed a[href="/top10/"]')
        .count()) > 0,
      mode + ' missing Top 10 destination'
    );
    await page.evaluate(() => scrollTo(0, 0));
    await screenshot(page, mode);
    await context.close();
  }
  const { page, context } = await makePage({ width: 390, height: 844 });
  // Test theme switch using the accessible button label supplied by the text header.
  const toggle = page.getByRole('button', { name: /모드로 전환/ });
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(150);
    await inspect(page, 'dark');
    await screenshot(page, 'dark');
    await page.getByRole('button', { name: /2위.*스포츠.*미리보기/ }).click();
    await page.mouse.move(0, 0);
    await inspectHighlight(page, 'dark');
    await page
      .locator('#popular-feed')
      .screenshot({ path: path.join(artifacts, 'dark-highlight.png') });
  } else check(false, 'missing theme switch');
  await context.close();
  const apiContext = await browser.newContext();
  try {
    const response = await apiContext.request.get(
      'https://api.마약.kr/boardservice/api/boards/issues?hours=24&limit=16',
      { timeout: 15000 }
    );
    const daily = await apiContext.request.get(
      'https://api.마약.kr/boardservice/api/boards/daily?index=0&limit=10',
      { timeout: 15000 }
    );
    liveOverview = await response.json();
    livePosts = await daily.json();
    report.api = {
      status: response.status(),
      tags: liveOverview.tags?.length,
      posts: livePosts.length,
    };
    if (response.ok() && daily.ok()) {
      const actual = await makePage({ width: 1440, height: 900 }, 'actual');
      await inspect(actual.page, 'actual API');
      await screenshot(actual.page, 'actual-api');
      await actual.context.close();
    }
  } catch (error) {
    report.api = { unavailable: error.message };
  }
  await apiContext.close();
} finally {
  await browser.close();
}
check(!report.errors.length, 'browser errors: ' + report.errors.join('; '));
report.failures = failures;
await writeFile(path.join(artifacts, 'report.json'), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      artifacts,
      checks: report.viewports.length,
      motion: report.motion,
      refreshChecks: report.refresh.length,
      errors: report.errors,
      api: report.api,
      failures,
    },
    null,
    2
  )
);
assert.equal(failures.length, 0, failures.join('\n'));
