// Build first. Serves the build and API fixtures through interception; no real account is changed.
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
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
const artifacts = path.join(tmpdir(), 'codex-account-pages-review');
await mkdir(artifacts, { recursive: true });
const cache = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const cachedChrome = existsSync(cache)
  ? readdirSync(cache)
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      .map((name) => path.join(cache, name, 'chrome-win64/chrome.exe'))
      .find(existsSync)
  : undefined;
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: existsSync(playwright.chromium.executablePath()) ? undefined : cachedChrome,
});
const errors = [];
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const profile = {
      Id: 'account-member',
      userId: '123',
      nickname: '카카오 닉네임',
      displayName: '현재 이름',
      authProvider: 'kakao',
      profileImage: null,
      createTime: '2026-09-22T00:00:00Z',
      role: 'user',
    };
    let writes = 0;
    await context.addInitScript(() => {
      if (!localStorage.getItem('read-storage')) {
        localStorage.setItem(
          'read-storage',
          JSON.stringify({
            state: { readPosts: { recent: '2026-09-22T00:00:00Z', legacy: true } },
            version: 0,
          })
        );
      }
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const json = (data, status = 200) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(data),
          headers: {
            'access-control-allow-origin': 'http://account.invalid',
            'access-control-allow-credentials': 'true',
            'access-control-allow-methods': 'GET, PATCH, OPTIONS',
            'access-control-allow-headers': 'content-type',
          },
        });
      if (request.method() === 'OPTIONS') return json({});
      if (url.pathname.endsWith('/api/users/me')) {
        if (request.method() === 'PATCH') {
          writes += 1;
          profile.displayName = request.postDataJSON().displayName;
        }
        return json(profile);
      }
      if (url.pathname.endsWith('/boards/filters'))
        return json({ sites: [], categories: [], tags: [] });
      if (url.pathname.endsWith('/boards/realtime')) return json([]);
      if (url.hostname !== 'account.invalid') return json(null, 401);
      let file;
      if (['/account/settings/', '/account/history/'].includes(url.pathname)) {
        file = path.join(root, '.next/server/app', url.pathname.slice(1, -1) + '.html');
      } else if (url.pathname.startsWith('/_next/static/')) {
        file = path.join(root, '.next/static', url.pathname.slice('/_next/static/'.length));
      } else file = path.join(root, 'public', decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep)) return route.abort();
      try {
        const contentType =
          {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.woff2': 'font/woff2',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
          }[path.extname(file)] || 'application/octet-stream';
        return route.fulfill({ contentType, body: await readFile(file) });
      } catch {
        return route.fulfill({ status: 404, body: '' });
      }
    });
    await page.goto('http://account.invalid/account/settings/', { waitUntil: 'networkidle' });
    assert.deepEqual(errors, []);
    await page.getByText('지금까지 2개의 글을 읽었습니다.').waitFor();
    const name = page.getByRole('textbox', { name: '표시 이름' });
    await name.fill(' 새 이름 ');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await page.getByText('표시 이름을 저장했습니다.').waitFor();
    assert.equal(profile.displayName, '새 이름');
    assert.equal(await name.inputValue(), '새 이름');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await name.inputValue(), '새 이름');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false
    );
    await page.screenshot({
      path: path.join(artifacts, `settings-${width}.png`),
      animations: 'disabled',
    });
    await name.fill('');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await page.getByText('표시 이름을 비웠습니다.').waitFor();
    assert.equal(profile.displayName, null);
    assert.equal(writes, 2);
    await page.goto('http://account.invalid/account/history/', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '계정 기록' }).waitFor();
    await page.getByText('예전 기록').waitFor();
    await page.screenshot({
      path: path.join(artifacts, `history-${width}.png`),
      animations: 'disabled',
    });
    await page.getByRole('button', { name: '기록 비우기' }).click();
    await page.getByText('아직 이 브라우저에 저장된 읽은 글이 없습니다.').waitFor();
    await page.goto('http://account.invalid/account/settings/', { waitUntil: 'networkidle' });
    await page.getByText('지금까지 0개의 글을 읽었습니다.').waitFor();
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log(JSON.stringify({ result: 'passed', widths: [390, 1440], errors, artifacts }));
} finally {
  await browser.close();
}
