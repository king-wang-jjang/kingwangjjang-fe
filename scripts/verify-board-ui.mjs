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

console.log('Verifying Board UI architecture and local server configuration...');

// Verify Logo logic
assert.match(
  appShell,
  /component="img"[\s\S]*src="\/favicon\.svg"/,
  'app shell should render the existing favicon as the only brand mark'
);
assert.doesNotMatch(
  appShell,
  /Kingwangjjang|Workspace|Drawer/,
  'app shell should not restore template text/sidebar chrome'
);

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
assert.match(themeProvider, /#fdfdf8/i, 'theme should restore the warm app background');
assert.match(themeProvider, /#F54E00/i, 'theme should restore the orange brand accent');
assert.match(boardView, /#eeefe9/i, 'board view should use the previous sage panel surface');
assert.match(boardView, /#bfc1b7/i, 'board view should use the previous neutral border');
assert.match(
  boardView,
  /카드를 누르면 여기에서 댓글을 바로 볼 수 있어요/,
  'board view should keep card-click comment UX'
);
assert.doesNotMatch(
  firstPartyText,
  /Minimal|Minimals|minimal-kit|docs\.minimals|mui\.com\/store|Envato/i,
  'first-party files should not contain Minimal Dashboard license/template references'
);

console.log('✅ UI verification passed!');
