import fs from 'node:fs';
import assert from 'node:assert/strict';

function readRequired(path) {
  assert.equal(fs.existsSync(path), true, 'Missing required file: ' + path);
  return fs.readFileSync(path, 'utf8');
}

console.log('Verifying Top 10 UI contract...');

const topBoardsHook = readRequired('src/hooks/use-top-boards.ts');

assert.match(
  topBoardsHook,
  /TOP_BOARDS_LIMIT\s*=\s*10/,
  'Top 10 hook should cap the ranking at ten posts'
);
assert.match(
  topBoardsHook,
  /queryKey:\s*TOP_BOARDS_QUERY_KEY/,
  'Top 10 hook should use a stable query key'
);
assert.match(
  topBoardsHook,
  /getDailyBoards\(0,\s*TOP_BOARDS_LIMIT\)/,
  'Top 10 hook should request the first ten daily-ranked posts'
);
assert.match(
  topBoardsHook,
  /placeholderData:\s*\(previousData\)\s*=>\s*previousData/,
  'Top 10 hook should preserve successful data while refreshing'
);

const top10List = readRequired('src/components/top10/top10-list.tsx');
const top10Index = readRequired('src/components/top10/index.ts');

assert.match(
  top10List,
  /type Top10ListProps[\s\S]*variant\?: 'sidebar' \| 'page'/,
  'shared Top 10 list should expose sidebar and page variants'
);
assert.match(top10List, /component="ol"/, 'ranking content should use ordered-list semantics');
assert.match(
  top10List,
  /posts\.slice\(0,\s*TOP_BOARDS_LIMIT\)/,
  'ranking UI should defensively render at most ten rows'
);
assert.match(top10List, /isPending/, 'ranking UI should render a loading state');
assert.match(top10List, /isError/, 'ranking UI should render an error state');
assert.match(top10List, /refetch/, 'ranking error state should expose retry');
assert.match(top10List, /target="_blank"/, 'ranking links should open original posts');
assert.match(
  top10List,
  /rel="noopener noreferrer"/,
  'external ranking links should isolate the opener'
);
assert.match(
  top10Index,
  /export \{ Top10List \} from '\.\/top10-list'/,
  'Top 10 component should have a focused public export'
);

const boardView = readRequired('src/sections/board/view/board-view.tsx');

assert.match(
  boardView,
  /<Top10List variant="sidebar" \/>/,
  'desktop workbench should render the shared Top 10 sidebar'
);
assert.match(
  boardView,
  /position: 'sticky'[\s\S]*maxHeight: 'calc\(100vh - 94px\)'[\s\S]*overflowY: 'auto'/,
  'desktop left column should float and remain usable on short viewports'
);
assert.match(
  boardView,
  /isContentFirstLayout &&[\s\S]*href="\/top10"[\s\S]*TOP 10/,
  'content-first layouts should link to the dedicated Top 10 page'
);

const appShell = readRequired('src/layouts/app-shell.tsx');
const top10View = readRequired('src/sections/top10/view/top10-view.tsx');
const top10Layout = readRequired('src/app/top10/layout.tsx');
const top10Page = readRequired('src/app/top10/page.tsx');

assert.match(
  appShell,
  /label: 'TOP 10'[\s\S]*href: '\/top10'[\s\S]*EmojiEventsOutlinedIcon/,
  'mobile drawer should expose the Top 10 route'
);
assert.match(
  top10View,
  /<Top10List variant="page" \/>/,
  'dedicated route should reuse the shared page variant'
);
assert.match(
  top10View,
  /href="\/board"[\s\S]*실시간 게시판/,
  'dedicated route should provide a clear return to the board'
);
assert.match(top10Layout, /<AppShell>/, 'Top 10 route should reuse the app shell');
assert.match(top10Page, /<Top10View \/>/, 'Top 10 page should render its focused view');

const packageJson = readRequired('package.json');

assert.match(
  packageJson,
  /verify-auth-profile-ui\.mjs && node scripts\/verify-top10-ui\.mjs/,
  'repository check should run the Top 10 UI contract'
);

console.log('Top 10 UI contract passed.');
