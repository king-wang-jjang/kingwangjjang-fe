import fs from 'node:fs';
import assert from 'node:assert/strict';

function readRequired(path) {
  assert.equal(fs.existsSync(path), true, 'Missing required file: ' + path);
  return fs.readFileSync(path, 'utf8');
}

console.log('Verifying admin Shorts UI contract...');

const authTypes = readRequired('src/auth/types.ts');
const authStore = readRequired('src/store/auth-store.ts');
const permissions = readRequired('src/auth/permissions.ts');
const adminGuard = readRequired('src/auth/guard/admin-guard.tsx');
const adminLayout = readRequired('src/app/admin/layout.tsx');
const adminPage = readRequired('src/app/admin/shorts/page.tsx');
const serverProxyExists = fs.existsSync('src/proxy.ts');
const boardApi = readRequired('src/api/board-api.ts');
const shortsHook = readRequired('src/hooks/use-top10-shorts-package.ts');
const shortsView = readRequired('src/sections/admin/shorts/view/shorts-view.tsx');
const appShell = readRequired('src/layouts/app-shell.tsx');

assert.match(
  authTypes,
  /UserRole = 'user' \| 'admin'/,
  'user contract should expose explicit roles'
);
assert.match(authTypes, /role: UserRole/, 'authenticated users should include their trusted role');
assert.match(
  authStore,
  /authStatus: 'checking' \| 'authenticated' \| 'unauthenticated'/,
  'auth store should distinguish session checking from anonymous state'
);
assert.match(
  permissions,
  /user\?\.role === 'admin'/,
  'admin permission should fail closed unless the server role is admin'
);
assert.match(
  adminGuard,
  /authStatus === 'checking'[\s\S]*authStatus === 'unauthenticated'[\s\S]*!isAdmin\(user\)[\s\S]*접근 권한이 없습니다/,
  'admin guard should handle loading, anonymous, and forbidden states before rendering children'
);
assert.match(
  adminLayout,
  /<AppShell>[\s\S]*<AdminGuard>\{children\}<\/AdminGuard>[\s\S]*<\/AppShell>/,
  'all admin routes should share the app shell and admin guard'
);
assert.match(
  adminPage,
  /robots: \{ index: false, follow: false \}/,
  'admin route should be noindex'
);
assert.match(adminPage, /<ShortsView \/>/, 'admin Shorts page should render its focused view');
assert.equal(
  serverProxyExists,
  false,
  'frontend server must not reject sessions using API-origin host-only cookies'
);

assert.match(
  boardApi,
  /ShortsScene[\s\S]*nanoBananaPrompt[\s\S]*Top10ShortsPackage[\s\S]*sources: ShortsSource\[\]/,
  'frontend API contract should include scenes, Nano Banana prompts, and canonical sources'
);
assert.match(
  boardApi,
  /nanoBananaRequestTemplate[\s\S]*response_format[\s\S]*aspect_ratio: '9:16'[\s\S]*image_size/,
  'export contract should include an Interactions API image request template'
);
assert.match(
  boardApi,
  /dataReady[\s\S]*publishReady[\s\S]*invalidSourceRanks[\s\S]*rightsReviewRequired[\s\S]*nanoBananaDraftRequests: NanoBananaImageRequest\[\][\s\S]*nanoBananaFinalRequestTemplates: NanoBananaImageRequest\[\]/,
  'package should validate readiness and expose separate draft and final requests'
);
assert.match(
  boardApi,
  /getDailyShortsPackage\(date\?: string\)[\s\S]*\/boardservice\/api\/boards\/daily\/shorts-package/,
  'Shorts data should load from the administrator-protected backend endpoint'
);
assert.match(
  shortsHook,
  /getDailyShortsPackage\(isToday \? undefined : selectedDate\)/,
  'Shorts query should support today and stored Top10 dates'
);
assert.match(
  shortsHook,
  /refetchInterval: isToday \? 5 \* 60_000 : false/,
  'today package should refresh on the same five-minute production cadence'
);
assert.match(
  shortsView,
  /Top10을 10→1 카운트다운[\s\S]*Nano Banana[\s\S]*JSON 다운로드/,
  'studio should explain the countdown workflow and expose a one-click JSON export'
);
assert.match(
  shortsView,
  /navigator\.clipboard\.writeText[\s\S]*nanoBananaPrompt[\s\S]*nanoBananaDraftRequests[\s\S]*nanoBananaFinalRequestTemplates[\s\S]*narrationScript/,
  'studio should copy image prompts, draft and final requests, and narration separately'
);
assert.match(
  shortsView,
  /target="_blank"[\s\S]*rel="noopener noreferrer"/,
  'source links should open safely in a new tab'
);
assert.match(
  shortsView,
  /resolveThumbnailSrc\(source\.thumbnailUrl\)/,
  'downloaded package should expose portable absolute thumbnail URLs'
);
assert.match(
  appShell,
  /isAdmin\(user\)[\s\S]*href="\/admin\/shorts"[\s\S]*Shorts Studio/,
  'only admins should see the Shorts Studio profile navigation'
);
assert.match(
  appShell,
  /authStatus === 'checking'[\s\S]*로그인 상태 확인 중[\s\S]*isAuthenticated && user/,
  'app shell should not flash an anonymous login action while session state is checking'
);
assert.match(
  adminGuard,
  /recoverAuthSession\(\)[\s\S]*session\.status === 'authenticated'[\s\S]*session\.status === 'unauthenticated'[\s\S]*setInterval\(refreshSession, 60_000\)[\s\S]*visibilitychange/,
  'admin guard should recover expired access sessions without logging out on temporary failures'
);
assert.match(
  shortsView,
  /aria-label=\{`\$\{field\.label\} 복사`\}[\s\S]*copyAriaLabel=\{`\$\{scene\.overlayText\}/,
  'repeated copy actions should expose their target in accessible names'
);

console.log('Admin Shorts UI contract passed.');
