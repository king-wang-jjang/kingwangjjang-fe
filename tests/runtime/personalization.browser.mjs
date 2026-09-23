// Build first. Runs the real Next app with isolated API fixtures; no real account/data is used.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
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
const port = 18083;
const origin = `http://127.0.0.1:${port}`;
const artifacts = path.join(tmpdir(), 'codex-personalization-review');
await mkdir(artifacts, { recursive: true });
const cacheRoot = path.join(process.env.LOCALAPPDATA || tmpdir(), 'ms-playwright');
const cachedChrome = existsSync(cacheRoot)
  ? readdirSync(cacheRoot)
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      .map((name) => path.join(cacheRoot, name, 'chrome-win64/chrome.exe'))
      .find(existsSync)
  : undefined;
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'],
  {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  }
);
let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
let browser;
const emptyProfile = () => ({
  schemaVersion: 1,
  enabled: true,
  events: [],
  followedTags: [],
  hiddenTags: [],
  resetAt: null,
});
const posts = Array.from({ length: 8 }, (_, index) => ({
  _id: `fixture-${index}`,
  no: index,
  category: 'free',
  site: 'dcinside',
  site_label: '디시인사이드',
  title: `추천 검증 게시글 ${index + 1}`,
  url: `https://example.com/${index}`,
  contents: [],
  tags: index % 2 ? ['스포츠'] : ['게임'],
  gpt_answer: '브라우저에서 확인하는 게시글 요약입니다.',
  analysis_status: 'done',
  create_time: new Date().toISOString(),
  comment_count: 0,
  likeCount: 0,
}));
try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error(serverOutput);
    try {
      if ((await fetch(origin)).ok) break;
    } catch {
      /* Server is starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  browser = await playwright.chromium.launch({
    headless: true,
    executablePath: existsSync(playwright.chromium.executablePath()) ? undefined : cachedChrome,
  });
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    const recommendations = [];
    const mutations = [];
    let signedIn = false;
    let profile = emptyProfile();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      const json = (data, status = 200) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(data),
          headers: {
            'access-control-allow-origin': origin,
            'access-control-allow-credentials': 'true',
            'access-control-allow-methods': 'GET, POST, OPTIONS',
            'access-control-allow-headers': 'content-type',
          },
        });
      if (route.request().method() === 'OPTIONS') return json(null);
      if (url.pathname === '/login') {
        signedIn = true;
        return route.fulfill({ status: 302, headers: { location: origin }, body: '' });
      }
      if (url.pathname.includes('/userservice/api/users/me'))
        return json(
          signedIn
            ? {
                Id: 'member',
                userId: 'member',
                authProvider: 'kakao',
                nickname: '검증 회원',
                role: 'user',
                createTime: new Date().toISOString(),
              }
            : null
        );
      if (url.pathname.includes('/api/auth/refresh')) return json(null, 401);
      if (url.pathname.endsWith('/recommendations/profile')) {
        if (route.request().method() === 'POST') {
          const payload = route.request().postDataJSON();
          mutations.push(...payload.mutations);
          payload.mutations.forEach((mutation) => {
            if (mutation.kind === 'merge') profile = { ...mutation.profile };
            if (mutation.kind === 'record') profile.events.push(...mutation.events);
          });
        }
        return json(profile);
      }
      if (url.pathname.endsWith('/recommendations/posts')) {
        const { ids } = route.request().postDataJSON();
        return json(ids.map((id) => posts.find((post) => post._id === id)).filter(Boolean));
      }
      if (url.pathname.endsWith('/recommendations')) {
        const payload = route.request().postDataJSON();
        recommendations.push(payload);
        const selectedProfile = signedIn ? profile : payload.profile;
        const dismissed = new Set(
          (selectedProfile?.events ?? [])
            .filter((event) => event.kind === 'dismiss')
            .map((event) => event.boardId)
        );
        return json({
          items: posts
            .filter(
              (post) =>
                (!payload.tag || post.tags.includes(payload.tag)) &&
                !dismissed.has(post._id) &&
                !(selectedProfile?.hiddenTags ?? []).some((tag) => post.tags.includes(tag))
            )
            .map((post) => ({ id: post._id, reason: `#${post.tags[0]} 관심 태그와 관련된 글` })),
        });
      }
      if (url.pathname.includes('/boards/realtime'))
        return json(
          posts.filter(
            (post) =>
              !url.searchParams.get('tag') || post.tags.includes(url.searchParams.get('tag'))
          )
        );
      if (url.pathname.includes('/boards/filters'))
        return json({ sites: [{ value: 'dcinside', label: '디시인사이드' }] });
      if (url.pathname.includes('/boards/daily')) return json([]);
      if (url.pathname.includes('/boards/issues'))
        return json({
          generated_at: new Date().toISOString(),
          window_hours: 24,
          total_posts: 0,
          total_tags: 0,
          tags: [],
          hourly_rankings: [],
        });
      if (url.pathname.includes('/commentservice/')) return json({ comments: [], totalCount: 0 });
      if (url.origin === origin) return route.continue();
      return route.abort();
    });
    await page.goto(`${origin}/board/`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '맞춤 추천', exact: true }).waitFor();
    await page.waitForFunction(() => localStorage.getItem('tag-interests:v1:guest') !== null);
    for (let index = 0; index < 5; index += 1)
      await page.getByText(posts[index].title, { exact: true }).first().click();
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem('tag-interests:v1:guest'))?.profile.events.length >= 5
    );
    await page.getByRole('button', { name: '맞춤 추천', exact: true }).click();
    await page.getByRole('button', { name: '로그인하고 저장' }).waitFor();
    assert.equal(recommendations.length, 1);
    assert.equal(recommendations[0].profile.events.length, 5);
    await page.getByRole('button', { name: `${posts[0].title} 관심 없음` }).click();
    assert.equal(await page.getByText(posts[0].title, { exact: true }).count(), 0);
    await page.getByRole('button', { name: '관심사 관리', exact: true }).click();
    await page.getByRole('textbox', { name: '관심 태그' }).fill('게임');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem('tag-interests:v1:guest')).profile.followedTags.includes(
        '게임'
      )
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      `horizontal overflow at ${width}px`
    );
    await page.screenshot({ path: path.join(artifacts, `interests-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: '로그인하고 저장' }).click();
    await page.waitForURL(
      (url) => url.pathname === '/board/' && url.searchParams.get('feed') === 'for-you'
    );
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem('tag-interests:v1:guest')).profile.events.length === 0
    );
    assert.equal(mutations.filter((mutation) => mutation.kind === 'merge').length, 1);
    assert.ok(profile.followedTags.includes('게임'));
    await page.goto(`${origin}/board/?tag=${encodeURIComponent('게임')}&feed=for-you`, {
      waitUntil: 'networkidle',
    });
    await page.getByText(posts[2].title, { exact: true }).waitFor();
    assert.equal(await page.getByText(posts[1].title, { exact: true }).count(), 0);
    assert.equal(recommendations.at(-1).tag, '게임');
    assert.equal(recommendations.at(-1).profile, undefined);
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      `Passed ${width}px: reads, guest storage, recommendation snapshot, dismiss, follow, login import, return path and explicit tag filter.`
    );
  }
  console.log(`Screenshots: ${artifacts}`);
} finally {
  await browser?.close();
  server.kill();
}
