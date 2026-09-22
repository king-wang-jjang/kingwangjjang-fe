// Build first, then run with Node. All API calls use local fixtures; no server is needed.
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
const artifacts = path.join(tmpdir(), 'codex-admin-users-review');
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

async function makePage(width, role = 'admin') {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  const members = Array.from({ length: 23 }, (_, index) => ({
    Id: `member-${index}`,
    userId: String(1000 + index),
    nickname: index === 0 ? '운영자' : `회원 ${index}`,
    displayName: index === 1 ? '긴표시이름을사용하는회원을위한테스트입니다'.repeat(2) : null,
    authProvider: 'kakao',
    profileImage: null,
    createTime: '2026-09-22T00:00:00Z',
    role: index === 0 ? 'admin' : 'user',
  }));
  let adminRequests = 0;
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
          'access-control-allow-origin': 'http://members.invalid',
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'GET, PATCH, OPTIONS',
          'access-control-allow-headers': 'content-type',
        },
      });
    if (request.method() === 'OPTIONS') return json({});
    if (url.pathname.endsWith('/api/users/me')) return json({ ...members[0], role });
    if (url.pathname.includes('/api/admin/users')) {
      adminRequests += 1;
      const id = url.pathname.split('/api/admin/users/')[1];
      if (id) {
        const member = members.find((item) => item.Id === id);
        if (!member) return json({ detail: 'User not found' }, 404);
        if (request.method() === 'PATCH') member.displayName = request.postDataJSON().displayName;
        return json(member);
      }
      const q = url.searchParams.get('q') || '';
      const filterRole = url.searchParams.get('role');
      const pageNumber = Number(url.searchParams.get('page') || 1);
      const pageSize = Number(url.searchParams.get('pageSize') || 20);
      const items = members.filter(
        (member) =>
          (!filterRole || member.role === filterRole) &&
          [member.nickname, member.displayName, member.userId, member.Id].some((value) =>
            value?.includes(q)
          )
      );
      return json({
        items: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
        total: items.length,
        page: pageNumber,
        pageSize,
      });
    }
    if (url.hostname !== 'members.invalid') return json(null, 401);
    let file;
    if (url.pathname === '/admin/users/')
      file = path.join(root, '.next/server/app/admin/users.html');
    else if (url.pathname.startsWith('/_next/static/')) {
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
  await page.goto('http://members.invalid/admin/users/', { waitUntil: 'networkidle' });
  return { page, context, adminRequests: () => adminRequests };
}

try {
  for (const width of [320, 390, 1440]) {
    const { page, context } = await makePage(width);
    await page.getByText('전체 회원 23명').waitFor();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      `${width}: page overflow`
    );
    await page.screenshot({ path: path.join(artifacts, `members-${width}.png`) });
    await page.getByRole('button', { name: '다음 페이지' }).click();
    await page.getByRole('button', { name: '회원 22 상세 보기', exact: true }).waitFor();
    await page.getByRole('textbox', { name: '회원 검색' }).fill('회원 22');
    await page.getByRole('button', { name: '검색', exact: true }).click();
    await page.getByText('검색 결과 1명').waitFor();
    await page.getByRole('button', { name: '회원 22 상세 보기', exact: true }).click();
    await page.getByRole('textbox', { name: '표시 이름' }).fill('수정한 회원');
    await page.screenshot({
      path: path.join(artifacts, `detail-${width}.png`),
      animations: 'disabled',
    });
    await page.getByRole('button', { name: '변경 저장' }).click();
    await page.getByText('수정한 회원 회원의 표시 이름을 저장했습니다.').waitFor();
    await page.getByRole('button', { name: '초기화' }).click();
    await page.getByText('전체 회원 23명').waitFor();
    await page.getByRole('combobox', { name: '권한', exact: true }).click();
    await page.getByRole('option', { name: '관리자', exact: true }).click();
    await page.getByText('검색 결과 1명').waitFor();
    await page.getByRole('button', { name: '다크 모드로 전환' }).click();
    await page.screenshot({ path: path.join(artifacts, `dark-${width}.png`) });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false
    );
    await context.close();
  }
  const regular = await makePage(390, 'user');
  await regular.page.getByText('접근 권한이 없습니다').waitFor();
  assert.equal(regular.adminRequests(), 0);
  await regular.context.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'passed', widths: [320, 390, 1440], artifacts }));
} finally {
  await browser.close();
}
