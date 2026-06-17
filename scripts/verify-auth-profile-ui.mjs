import fs from 'fs';
import assert from 'assert/strict';

const appShell = fs.readFileSync('src/layouts/app-shell.tsx', 'utf8');
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

console.log('Authenticated profile UI contract passed.');
