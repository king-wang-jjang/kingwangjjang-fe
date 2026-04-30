import fs from 'fs';
import assert from 'assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');

const appLayout = read('src/app/layout.tsx');
const appShell = read('src/layouts/app-shell.tsx');
const configGlobal = read('src/config-global.ts');
const apiHttp = read('src/api/http.ts');
const oauthForm = read('src/auth/components/form-oauth.tsx');
const boardView = read('src/sections/board/view/board-view.tsx');

console.log('Verifying Board UI architecture and local server configuration...');

// Verify Logo logic
assert.match(
  appShell,
  /bgcolor:\s*['"]primary\.main['"]/,
  'app shell should render the primary logo icon'
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

console.log('✅ UI verification passed!');
