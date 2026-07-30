import fs from 'fs';
import assert from 'assert/strict';

const appShell = fs.readFileSync('src/layouts/app-shell.tsx', 'utf8');
const userApi = fs.readFileSync('src/api/user-api.ts', 'utf8');
const authTypes = fs.readFileSync('src/auth/types.ts', 'utf8');
const authStore = fs.readFileSync('src/store/auth-store.ts', 'utf8');
const authInitializer = fs.readFileSync('src/auth/auth-initializer.tsx', 'utf8');
const sessionRecovery = fs.readFileSync('src/auth/session-recovery.ts', 'utf8');
const httpApi = fs.readFileSync('src/api/http.ts', 'utf8');
const readStore = fs.readFileSync('src/store/read-store.ts', 'utf8');
const settingsPage = fs.readFileSync('src/app/account/settings/page.tsx', 'utf8');
const historyPage = fs.readFileSync('src/app/account/history/page.tsx', 'utf8');
const commentForm = fs.readFileSync('src/components/comment/comment-form.tsx', 'utf8');
const accountLayoutExists = fs.existsSync('src/app/account/layout.tsx');
const accountSettingsExists = fs.existsSync('src/app/account/settings/page.tsx');
const accountHistoryExists = fs.existsSync('src/app/account/history/page.tsx');

console.log('Verifying authenticated profile UI contract...');

assert.match(
  appShell,
  /useAuthStore/,
  'app shell should read authenticated user state'
);
assert.match(
  authInitializer,
  /recoverAuthSession\(\)[\s\S]*session\.status === 'authenticated'[\s\S]*session\.status === 'unauthenticated'[\s\S]*Math\.min\([\s\S]*SESSION_RETRY_MAX_DELAY_MS[\s\S]*setTimeout\(checkUserSession, retryDelay\)/,
  'app startup should distinguish session states and back off during temporary outages'
);
assert.match(
  sessionRecovery,
  /const currentUser = await getMeWithRetry\(\)[\s\S]*if \(currentUser\)[\s\S]*refreshWithRetry\(\)[\s\S]*Another tab can win refresh-token rotation[\s\S]*const recoveredUser = await getMeAfterRefresh\(\)/,
  'session recovery should refresh after a null user and re-probe after a losing tab gets 401'
);
assert.match(
  sessionRecovery,
  /TRANSIENT_RETRY_DELAYS_MS[\s\S]*error\.status >= 500[\s\S]*getMeAfterRefresh[\s\S]*await wait\(TRANSIENT_RETRY_DELAYS_MS\[retryIndex\]\)[\s\S]*result !== 'unavailable'[\s\S]*retryIndex \+ 1/,
  'session recovery should retry network and server-side authentication outages'
);
assert.match(
  httpApi,
  /AuthRefreshResult = 'refreshed' \| 'unauthenticated' \| 'unavailable'[\s\S]*response\.status === 401[\s\S]*return 'unavailable'/,
  'refresh requests should distinguish invalid sessions from temporary failures'
);
assert.match(
  httpApi,
  /response\.status === 401[\s\S]*refreshAuthSession\(\)[\s\S]*request\(path, options\)/,
  'API requests should renew and retry once when the access token expires'
);
assert.match(
  appShell,
  /isAuthenticated/,
  'app shell should branch on authenticated state'
);
assert.match(
  appShell,
  /<Avatar[\s\S]*src=\{user\?\.profileImage \|\| undefined\}/,
  'authenticated header should show the Kakao profile image when available'
);
assert.match(
  authTypes,
  /displayName\?: string \| null/,
  'user type should include the local display name'
);
assert.match(
  userApi,
  /updateMeProfile[\s\S]*PATCH[\s\S]*displayName/,
  'user API should expose a PATCH profile update helper'
);
assert.match(
  authStore,
  /updateUser:[\s\S]*Partial<UserTypeWithoutNull>/,
  'auth store should support merging returned profile updates'
);
assert.match(
  appShell,
  /userDisplayName[\s\S]*displayName[\s\S]*nickname[\s\S]*userId/,
  'header display name should prefer local displayName before Kakao nickname'
);
assert.match(
  commentForm,
  /displayName[\s\S]*nickname[\s\S]*userId/,
  'comment composer avatar should prefer the same display name order'
);
assert.match(
  appShell,
  /AccountCircleOutlinedIcon/,
  'profile menu should expose user settings'
);
assert.match(
  appShell,
  /HistoryOutlinedIcon/,
  'profile menu should expose user history'
);
assert.match(
  appShell,
  /SocialLoginButtons/,
  'anonymous header should still show Kakao login'
);
assert.match(
  appShell,
  /isAuthenticated && user[\s\S]*\?[\s\S]*<UserProfileMenu[\s\S]*:[\s\S]*<SocialLoginButtons/,
  'header should swap the Kakao login button for the profile menu after login'
);
assert.equal(accountLayoutExists, true, 'account pages should use the app shell layout');
assert.equal(accountSettingsExists, true, 'profile menu settings should have a real page');
assert.equal(accountHistoryExists, true, 'profile menu history should have a real page');
assert.match(
  settingsPage,
  /updateMeProfile[\s\S]*TextField[\s\S]*표시 이름[\s\S]*읽은 글/,
  'settings page should let the user edit display name and see reading stats'
);
assert.match(
  readStore,
  /getReadEntries[\s\S]*clearReadHistory[\s\S]*readPosts/,
  'read store should expose timestamped entries and a clear action'
);
assert.match(
  historyPage,
  /getReadEntries/,
  'history page should read timestamped entries from the read store'
);
assert.match(
  historyPage,
  /최근 읽은 글/,
  'history page should show recent read posts'
);
assert.match(
  historyPage,
  /clearReadHistory/,
  'history page should allow clearing local history'
);

console.log('Authenticated profile UI contract passed.');
