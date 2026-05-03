import fs from 'fs';
import assert from 'assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');

const appLayout = read('src/app/layout.tsx');
const appShell = read('src/layouts/app-shell.tsx');
const configGlobal = read('src/config-global.ts');
const apiHttp = read('src/api/http.ts');
const oauthForm = read('src/auth/components/form-oauth.tsx');
const boardView = read('src/sections/board/view/board-view.tsx');
const themeProvider = read('src/theme/app-theme-provider.tsx');
const logoSingle = read('public/logo/logo-single.svg');
const logoFull = read('public/logo/logo-full.svg');
const packageJson = read('package.json');
const readme = read('README.md');
const projectOverview = read('PROJECT_OVERVIEW.md');

const firstPartyText = [
  packageJson,
  readme,
  projectOverview,
  appLayout,
  appShell,
  configGlobal,
  apiHttp,
  oauthForm,
  boardView,
  themeProvider,
].join('\n');

console.log('Verifying legacy-logo Board UI architecture and local server configuration...');

// Verify legacy logo app chrome
assert.match(
  appShell,
  /src="\/logo\/logo-single\.svg"/,
  'app shell should render the legacy single logo asset'
);
assert.doesNotMatch(
  appShell,
  /component="img"[\s\S]*src="\/favicon\.svg"/,
  'app shell should not use the favicon as the header brand mark'
);
assert.doesNotMatch(
  appShell,
  /페이지 테스트 중 입니다\./,
  'app shell should not show the legacy test notice'
);
assert.match(logoSingle, /#f57e9a|#85dbd9|#ffd483/i, 'legacy single logo asset should exist');
assert.match(logoFull, /#00A76F|#1C252E/i, 'legacy full logo asset should exist');

// Verify Local Server Config
assert.match(
  configGlobal,
  /localServerUrl:\s*string/,
  'config should expose a local API server URL for local OAuth redirects'
);
assert.match(oauthForm, /isLocalHostname/, 'Kakao login should detect local browser hosts');
assert.match(
  oauthForm,
  /CONFIG\.localServerUrl/,
  'Kakao login should use the local API server URL in local development'
);
assert.match(
  apiHttp,
  /LOCAL_AUTH_PREFIXES/,
  'local browser auth API requests should be routed separately from board data requests'
);
assert.match(
  apiHttp,
  /CONFIG\.localServerUrl/,
  'local browser auth API requests should use the local API server URL'
);
assert.match(themeProvider, /#ffffff/i, 'theme should restore the legacy white app background');
assert.match(themeProvider, /#00A76F/i, 'theme should restore the legacy green brand accent');
assert.match(
  boardView,
  /<Grid container spacing=\{2\}/,
  'board view should restore the legacy grid layout'
);
assert.match(boardView, /<SocialLoginButtons \/>/, 'board view should restore the left login card');
assert.match(boardView, /translateX\(-50px\)/, 'board cards should restore the legacy hover slide');
assert.match(boardView, /Filters/, 'board view should restore the legacy filter label');
assert.doesNotMatch(
  firstPartyText,
  /Minimal|Minimals|minimal-kit|docs\.minimals|mui\.com\/store|Envato/i,
  'first-party files should not contain Minimal Dashboard license/template references'
);

console.log('✅ UI verification passed!');
