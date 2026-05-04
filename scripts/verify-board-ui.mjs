import fs from 'fs';
import assert from 'assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');

const packageJson = read('package.json');
const globalCss = read('src/global.css');
const rootLayout = read('src/app/layout.tsx');
const appShell = read('src/layouts/app-shell.tsx');
const boardView = read('src/sections/board/view/board-view.tsx');
const themeProvider = read('src/theme/app-theme-provider.tsx');
const oauthForm = read('src/auth/components/form-oauth.tsx');
const commentSidebar = read('src/components/comment/comment-sidebar.tsx');
const commentDrawer = read('src/components/comment/comment-drawer.tsx');
const commentSection = read('src/components/comment/comment-section.tsx');
const commentList = read('src/components/comment/comment-list.tsx');
const commentItem = read('src/components/comment/comment-item.tsx');
const commentForm = read('src/components/comment/comment-form.tsx');
const commentSkeleton = read('src/components/comment/comment-item-skeleton.tsx');

const redesignedFiles = [
  globalCss,
  rootLayout,
  appShell,
  boardView,
  themeProvider,
  oauthForm,
  commentSidebar,
  commentDrawer,
  commentSection,
  commentList,
  commentItem,
  commentForm,
  commentSkeleton,
].join('\n');

console.log('Verifying Board workbench redesign contract...');

assert.match(
  packageJson,
  /@fontsource-variable\/ibm-plex-sans/,
  'IBM Plex Sans Variable should be installed for the approved typography system'
);
assert.match(
  globalCss,
  /@import '@fontsource-variable\/ibm-plex-sans'/,
  'global CSS should import IBM Plex Sans Variable'
);
assert.match(
  themeProvider,
  /#fdfdf8/i,
  'theme should use warm parchment as the app background'
);
assert.match(themeProvider, /#4d4f46/i, 'theme should use olive ink body text');
assert.match(themeProvider, /#23251d/i, 'theme should use deep olive headings');
assert.match(themeProvider, /#bfc1b7/i, 'theme should use sage borders');
assert.match(themeProvider, /#F54E00/i, 'theme should define orange interaction accents');
assert.match(themeProvider, /borderRadius:\s*4/, 'theme should use compact 4px radius');
assert.doesNotMatch(
  themeProvider,
  /primary:\s*\{[\s\S]*main:\s*['"]#00A76F/i,
  'legacy green should no longer be the primary visual accent'
);

assert.match(rootLayout, /themeColor:\s*'#fdfdf8'/i, 'viewport theme color should match parchment');
assert.match(appShell, /Workspace/, 'app shell should keep the workspace navigation label');
assert.match(appShell, /#F54E00/i, 'app shell hover states should flash orange');
assert.match(appShell, /#bfc1b7/i, 'app shell should use sage borders');
assert.match(appShell, /background\.default/, 'app shell should use themed app background');

assert.match(boardView, /BoardWorkbench/, 'board view should expose a workbench container');
assert.match(boardView, /renderToolPane/, 'board view should render a dedicated left tool pane');
assert.match(boardView, /renderFeedHeader/, 'board view should render a feed header');
assert.match(boardView, /renderCommentEmptyState/, 'board view should keep a stable right-pane empty state');
assert.match(boardView, /gridTemplateColumns/, 'desktop board should use explicit workbench columns');
assert.match(boardView, /실시간 게시판/, 'board title copy should be valid Korean');
assert.match(boardView, /필터 초기화/, 'filter reset copy should be valid Korean');
assert.match(boardView, /게시글이 없습니다/, 'empty feed copy should be valid Korean');
assert.match(boardView, /#F54E00/i, 'post cards should use orange selected or hover accents');
assert.match(boardView, /#eeefe9/i, 'post cards and filters should use sage cream surfaces');

assert.match(oauthForm, /#1e1f23/i, 'login CTA should use the near-black primary button style');
assert.match(oauthForm, /카카오 로그인/, 'Kakao login text should remain available');
assert.match(commentSidebar, /#eeefe9/i, 'comment sidebar should use sage panel surface');
assert.match(commentDrawer, /#eeefe9/i, 'comment drawer should use sage panel surface');
assert.match(commentSection, /#eeefe9|background\.default|background\.paper/i, 'comment section should use themed surfaces');
assert.match(commentList, /첫 댓글을 남겨보세요/, 'comment empty state should keep valid Korean copy');
assert.match(commentItem, /#F54E00/i, 'comment actions should use orange hover accents');
assert.match(commentForm, /#1e1f23/i, 'comment submit buttons should use the dark primary style');
assert.match(commentSkeleton, /#eeefe9|background\.default|background\.paper/i, 'comment skeleton should use sage-themed surfaces');

assert.doesNotMatch(redesignedFiles, /\?ㅼ|\?볤|\?대|醫뗭|諛⑷|遺덈|寃뚯|湲|紐삵|�/, 'redesigned UI files should not contain visible mojibake strings');
assert.doesNotMatch(redesignedFiles, /#00A76F/i, 'redesigned UI files should not use the legacy green accent');
assert.doesNotMatch(redesignedFiles, /#8E33FF/i, 'redesigned UI files should not use the legacy purple accent');

console.log('Board workbench redesign contract passed.');
