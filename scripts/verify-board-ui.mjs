import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');

const appLayout = read('src/app/layout.tsx');
const dashboardLayout = read('src/layouts/dashboard/layout.tsx');
const boardView = read('src/sections/board/view/board-view.tsx');
const postCard = read('src/sections/board/board-post-card.tsx');
const boardFilters = read('src/sections/board/board-filters.tsx');

assert.match(
  appLayout,
  /url:\s*'\/favicon\.ico'/,
  'favicon should use the existing public favicon.ico'
);
assert.match(
  dashboardLayout,
  /isSingle/,
  'header should render the existing single logo icon only'
);
assert.doesNotMatch(
  boardView,
  /renderSourcePanel|Sources/,
  'desktop board should not include the old right source panel'
);
assert.match(boardView, /실시간 인기글/, 'board feed should have a clear Korean title');
assert.match(postCard, /#F54E00/i, 'post cards should use the orange hover accent from DESIGN.md');
assert.doesNotMatch(
  postCard,
  /!isMobile\s*&&\s*\(/,
  'external link should not render in the collapsed card chrome'
);
assert.match(
  postCard,
  /KeyboardArrowUpIcon/,
  'expanded GPT summary should use a caret-up close icon'
);
assert.match(
  postCard,
  /GPT 요약 접기/,
  'expanded GPT summary should expose an accessible collapse button'
);
assert.match(
  postCard,
  /댓글 보기/,
  'comments should open from a button inside the expanded summary'
);
assert.match(
  postCard,
  /원문 바로가기/,
  'external link should render as a clear action inside the expanded content'
);
assert.doesNotMatch(
  postCard,
  /variant="contained"[\s\S]*?(원문 바로가기|댓글 보기)/,
  'expanded footer actions should be visually quiet instead of prominent contained CTAs'
);
assert.match(
  boardView,
  /const handleCardClick = \(boardId: string, site: string\)/,
  'card clicks should receive the selected post identity'
);
assert.match(
  boardView,
  /setSelectedPost\(\{ boardId, site \}\)/,
  'card clicks should open or switch the visible comment panel'
);
assert.match(
  boardView,
  /DashboardContent maxWidth="lg"/,
  'desktop layout should stay in the existing centered dashboard width'
);
assert.match(boardFilters, /#eeefe9/i, 'filters should use the sage surface from DESIGN.md');

console.log('Board UI contract verified.');
