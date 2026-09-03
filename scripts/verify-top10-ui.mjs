import fs from 'node:fs';
import assert from 'node:assert/strict';

function readRequired(path) {
  assert.equal(fs.existsSync(path), true, 'Missing required file: ' + path);
  return fs.readFileSync(path, 'utf8');
}

console.log('Verifying Top 10 UI contract...');

const boardApi = readRequired('src/api/board-api.ts');
const boardPostUtils = readRequired('src/components/board-post/board-post-utils.ts');
const topBoardsHook = readRequired('src/hooks/use-top-boards.ts');
const topBoardAnalysisHook = readRequired('src/hooks/use-top-board-analysis.ts');
const top10Page = readRequired('src/app/top10/page.tsx');
const top10View = readRequired('src/sections/top10/view/top10-view.tsx');

assert.match(
  boardApi,
  /getDailyBoardHistoryDates[\s\S]*\/boardservice\/api\/boards\/daily\/history\/dates\?\$\{params\}/,
  'board API should expose the stored Top 10 dates endpoint'
);
assert.match(
  boardApi,
  /getDailyBoardHistory\(date:[\s\S]*\/boardservice\/api\/boards\/daily\/history\?\$\{params\}[\s\S]*posts\.map\(normalizeBoardPost\)/,
  'board API should normalize a selected historical Top 10 response'
);
assert.match(
  boardApi,
  /gptAnswer:\s*post\.gpt_answer[\s\S]*thumbnail:\s*post\.thumbnail/,
  'Top 10 normalization should retain summaries and thumbnails'
);
assert.match(
  boardPostUtils,
  /export function resolveThumbnailSrc[\s\S]*export function getPostSummary/,
  'board and Top 10 cards should share thumbnail and summary rules'
);

assert.match(
  topBoardsHook,
  /analysisStatus === 'pending'[\s\S]*analysisStatus === 'processing'[\s\S]*refetchInterval/,
  'today ranking should refresh automatically while background summaries are active'
);
assert.match(
  topBoardsHook,
  /TOP_BOARDS_LIMIT\s*=\s*10/,
  'Top 10 hook should cap the ranking at ten posts'
);
assert.match(
  topBoardsHook,
  /queryKey:\s*\[\.\.\.TOP_BOARDS_QUERY_KEY,\s*selectedDate\]/,
  'Top 10 hook should isolate cached rankings by selected date'
);
assert.match(
  topBoardsHook,
  /getDailyBoards\(0,\s*TOP_BOARDS_LIMIT\)/,
  'Top 10 hook should request the first ten daily-ranked posts'
);
assert.match(
  topBoardsHook,
  /getDailyBoardHistory\(selectedDate,\s*TOP_BOARDS_LIMIT\)/,
  'Top 10 hook should request the selected historical ranking'
);
assert.match(
  topBoardsHook,
  /staleTime:\s*isToday\s*\?\s*60_000\s*:\s*Infinity/,
  'historical rankings should stay fresh in the client cache'
);
assert.match(
  topBoardsHook,
  /gcTime:\s*isToday\s*\?[^:]+:\s*Infinity/,
  'historical rankings should remain available when switching dates'
);
assert.match(
  topBoardsHook,
  /useTopBoardHistoryDates[\s\S]*getDailyBoardHistoryDates\(TOP_BOARD_HISTORY_DATES_LIMIT\)/,
  'Top 10 history date options should load through a dedicated query'
);
assert.match(
  topBoardAnalysisHook,
  /selectedDate !== TOP_BOARDS_TODAY[\s\S]*!isAdminUser[\s\S]*reanalyzeBoardPost\(boardId\)[\s\S]*pollBoardAnalysisJob/,
  'only admins should be able to explicitly reanalyze today posts and poll the job'
);
assert.match(
  topBoardAnalysisHook,
  /setQueryData<BoardPost\[\]>[\s\S]*gptAnswer:\s*job\.summary/,
  'completed Top 10 summaries should update the selected ranking cache'
);

const top10List = readRequired('src/components/top10/top10-list.tsx');
const top10Index = readRequired('src/components/top10/index.ts');

assert.match(
  top10List,
  /type Top10ListProps[\s\S]*variant\?: 'sidebar' \| 'page'[\s\S]*selectedDate\?: string[\s\S]*initialExpandedRank\?: number/,
  'shared Top 10 list should expose sidebar, page, and selected-date inputs'
);
assert.match(
  top10List,
  /useTopBoards\(selectedDate\)/,
  'shared Top 10 list should query the requested date'
);
assert.match(top10List, /component="ol"/, 'ranking content should use ordered-list semantics');
assert.match(
  top10List,
  /posts\.slice\(0,\s*TOP_BOARDS_LIMIT\)/,
  'ranking UI should defensively render at most ten rows'
);
assert.match(
  top10List,
  /posts\.slice\(0,\s*TOP_BOARDS_LIMIT\)\.map\(\(post, index\) =>/,
  'ranking UI should assign ranks directly from the API-provided sequence'
);
assert.doesNotMatch(
  top10List,
  /posts(?:\s*\n?\s*|\.)[^;{}]*\.sort\(/,
  'ranking UI should not override the API-provided site-diversified order'
);
assert.match(top10List, /isPending/, 'ranking UI should render a loading state');
assert.match(top10List, /isError/, 'ranking UI should render an error state');
assert.match(top10List, /refetch/, 'ranking error state should expose retry');

const sidebarRowStart = top10List.indexOf('function Top10SidebarRow');
const pageRowStart = top10List.indexOf('type Top10PageRowProps');
const top10ListStart = top10List.indexOf('export function Top10List');

assert.notEqual(sidebarRowStart, -1, 'Top 10 should define a compact sidebar row');
assert.notEqual(pageRowStart, -1, 'Top 10 should define an expandable page row');
assert.notEqual(top10ListStart, -1, 'Top 10 should define its shared list');

const sidebarRowSource = top10List.slice(sidebarRowStart, pageRowStart);
const pageRowSource = top10List.slice(pageRowStart, top10ListStart);
const pageCollapseStart = pageRowSource.indexOf('<Collapse');

assert.match(
  sidebarRowSource,
  /component=\{Link\}[\s\S]*href=\{`\/top10\/\?rank=\$\{rank\}`\}/,
  'compact sidebar rows should navigate to their expanded Top 10 page row'
);
assert.doesNotMatch(
  sidebarRowSource,
  /Collapse|component="img"|getPostSummary/,
  'compact sidebar rows should not render expanded summary or image content'
);
assert.doesNotMatch(
  sidebarRowSource,
  /onOpenComments|CommentDrawer|ChatBubbleOutlineRoundedIcon/,
  'compact sidebar rows should remain navigation-only without comment controls'
);
assert.match(
  pageRowSource,
  /<ButtonBase[\s\S]*aria-expanded=\{expanded\}[\s\S]*aria-controls=\{detailsId\}/,
  'page rows should expose an accessible expansion trigger'
);
assert.notEqual(pageCollapseStart, -1, 'page rows should contain a collapsible details panel');
assert.doesNotMatch(
  pageRowSource.slice(0, pageCollapseStart),
  /href=\{post\.url\}|component="img"/,
  'collapsed page rows should not expose the image or source link'
);
assert.match(
  pageRowSource.slice(pageCollapseStart),
  /top10-expanded-panel[\s\S]*요약[\s\S]*component="img"[\s\S]*href=\{post\.url\}[\s\S]*원문 바로가기/,
  'expanded page rows should contain the summary, image, and source action'
);
assert.match(
  pageRowSource.slice(pageCollapseStart),
  /target="_blank"[\s\S]*rel="noopener noreferrer"/,
  'expanded source actions should open safely in a new tab'
);
assert.match(
  pageRowSource,
  /FavoriteBorderRoundedIcon[\s\S]*post\.likeCount \?\? 0/,
  'page rows should show each post like count'
);
assert.match(
  pageRowSource.slice(pageCollapseStart),
  /<Button[\s\S]*?type="button"[\s\S]*?startIcon=\{<ChatBubbleOutlineRoundedIcon fontSize="small" \/>\}[\s\S]*?onClick=\{\(\) => onCommentOpen\(post\)\}[\s\S]*?disabled=\{!post\.Id\}[\s\S]*?aria-label=\{`\$\{post\.title\} 댓글 열기`\}[\s\S]*?>[\s\S]*?댓글/,
  'expanded Top 10 rows should expose an accessible comment button for stored posts'
);
assert.match(
  top10List,
  /key=\{`\$\{selectedDate\}:\$\{key\}`\}/,
  'date changes should remount page rows and reset row-local image state'
);
assert.match(
  top10List,
  /component=\{Link\}[\s\S]*href="\/top10\/"/,
  'the sidebar heading should open the dedicated Top 10 page'
);
assert.match(
  top10List,
  /initialExpandedRank - 1[\s\S]*setExpandedItem/,
  'a rank query should expand that row'
);
assert.doesNotMatch(
  top10List.slice(
    top10List.indexOf('useEffect(() =>'),
    top10List.indexOf('return (', top10List.indexOf('useEffect(() =>'))
  ),
  /requestReanalysis|reanalyzeBoardPost/,
  'expanding a rank query should not trigger analysis'
);
assert.match(
  pageRowSource,
  /isToday && isAdminUser[\s\S]*재요약/,
  'the reanalysis button should only render for administrators on today posts'
);
assert.match(
  top10View,
  /if \(!post\.Id\) return;[\s\S]*setSelectedPost\(\{ boardId: post\.Id, site: post\.site \}\)/,
  'Top 10 comments should open the shared thread using the stored board ID and site'
);
assert.doesNotMatch(
  top10View,
  /boardId:\s*post\.Id\s*\|\||boardId:\s*`\$\{post\.site\}/,
  'Top 10 comment targets should never fall back to a site-number key'
);
assert.match(
  top10Page,
  /searchParams: Promise[\s\S]*parseRank[\s\S]*initialExpandedRank=\{parseRank\(rank\)\}/,
  'the Top 10 route should validate and forward rank query parameters'
);
assert.match(
  top10View,
  /initialExpandedRank\?: number[\s\S]*<Top10List[\s\S]*initialExpandedRank=\{initialExpandedRank\}/,
  'the Top 10 view should pass the requested expanded rank to the list'
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
  /position: 'sticky'[\s\S]*top: 'var\(--board-sticky-top, 78px\)'[\s\S]*maxHeight: 'calc\(100vh - var\(--board-sticky-top, 78px\) - 16px\)'[\s\S]*overflowY: 'auto'/,
  'desktop left column should follow the header and remain usable on short viewports'
);
assert.match(
  boardView,
  /isContentFirstLayout &&[\s\S]*href="\/top10\/"[\s\S]*TOP 10/,
  'content-first layouts should link to the dedicated Top 10 page'
);

const feedHeaderStart = boardView.indexOf('const renderFeedHeader');
const toolPaneStart = boardView.indexOf('const renderToolPane');
const commentEmptyStateStart = boardView.indexOf('const renderCommentEmptyState');

assert.notEqual(feedHeaderStart, -1, 'BoardView should define renderFeedHeader');
assert.notEqual(toolPaneStart, -1, 'BoardView should define renderToolPane');
assert.notEqual(commentEmptyStateStart, -1, 'BoardView should define renderCommentEmptyState');

const feedHeaderSource = boardView.slice(feedHeaderStart, toolPaneStart);
const toolPaneSource = boardView.slice(toolPaneStart, commentEmptyStateStart);

assert.doesNotMatch(
  boardView,
  /const renderFilters/,
  'standalone responsive filter card should be removed'
);
assert.match(
  feedHeaderSource,
  /className="filter-icon-button"[\s\S]*selectedSites\.map[\s\S]*필터 초기화/,
  'feed header should retain the site filter controls'
);
assert.equal(
  boardView.match(/필터 초기화/g)?.length,
  1,
  'feed header should be the only board filter reset location'
);
assert.doesNotMatch(
  toolPaneSource,
  /Workspace|Sites|FilterListIcon|selectedSites/,
  'desktop tool pane should only contain Top 10 content'
);
assert.match(
  toolPaneSource,
  /<Top10List variant="sidebar" \/>/,
  'desktop tool pane should retain the shared Top 10 sidebar'
);
assert.doesNotMatch(
  boardView,
  /isContentFirstLayout && renderFilters/,
  'content-first feed should not render a standalone filter card'
);

const appShell = readRequired('src/layouts/app-shell.tsx');
const top10Layout = readRequired('src/app/top10/layout.tsx');

assert.match(
  appShell,
  /label: 'TOP 10'[\s\S]*href: '\/top10\/'[\s\S]*EmojiEventsOutlinedIcon/,
  'mobile drawer should expose the Top 10 route'
);
assert.match(
  top10View,
  /useTopBoardHistoryDates\(\)/,
  'dedicated route should load saved ranking dates'
);
assert.match(
  top10View,
  /<MenuItem value=\{TOP_BOARDS_TODAY\}>오늘<\/MenuItem>/,
  'date selector should always include the live ranking'
);
assert.match(
  top10View,
  /ISO_DATE_PATTERN\.test\(date\) && date < today/,
  'date selector should only offer valid dates before today'
);
assert.match(
  top10View,
  /<Top10List[\s\S]*variant="page"[\s\S]*selectedDate=\{selectedDate\}[\s\S]*initialExpandedRank=\{initialExpandedRank\}/,
  'dedicated route should pass the selected date and requested rank to the shared list'
);
assert.match(
  top10View,
  /gridTemplateColumns:\s*'minmax\(0, 760px\) 320px'[\s\S]*<CommentSidebar/,
  'desktop Top 10 should place comments in a right sidebar'
);
assert.match(
  top10View,
  /<CommentDrawer[\s\S]*open=\{isMobile && mobileCommentOpen\}/,
  'mobile Top 10 should retain the bottom comment drawer'
);
assert.match(
  top10View,
  /과거 기록은 이 기능 배포 이후부터 날짜별로 쌓입니다/,
  'dedicated route should explain when historical records begin'
);
assert.match(
  top10View,
  /isDatesPending[\s\S]*isDatesError[\s\S]*!historyDates\.length/,
  'historical date controls should expose loading, error, and empty states'
);
assert.match(
  top10View,
  /href="\/board"[\s\S]*실시간 게시판/,
  'dedicated route should provide a clear return to the board'
);
assert.match(top10Layout, /<AppShell>/, 'Top 10 route should reuse the app shell');
assert.match(
  top10Page,
  /<Top10View initialExpandedRank=\{parseRank\(rank\)\} \/>/,
  'Top 10 page should render its focused view with a validated rank'
);

const packageJson = readRequired('package.json');

assert.match(
  packageJson,
  /verify-auth-profile-ui\.mjs && node scripts\/verify-top10-ui\.mjs/,
  'repository check should run the Top 10 UI contract'
);

console.log('Top 10 UI contract passed.');
