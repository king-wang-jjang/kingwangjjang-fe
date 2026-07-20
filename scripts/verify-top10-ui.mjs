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
assert.match(
  top10List,
  /component="ol"/,
  'ranking content should use ordered-list semantics'
);
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

console.log('Top 10 UI contract passed.');
