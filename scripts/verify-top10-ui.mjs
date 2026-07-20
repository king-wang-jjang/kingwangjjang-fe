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

console.log('Top 10 UI contract passed.');
