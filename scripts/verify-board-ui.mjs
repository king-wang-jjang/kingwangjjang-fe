import fs from 'fs';
import assert from 'assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');

const packageJson = read('package.json');
const globalCss = read('src/global.css');
const rootLayout = read('src/app/layout.tsx');
const rootPage = read('src/app/page.tsx');
const appLoading = read('src/app/loading.tsx');
const appShell = read('src/layouts/app-shell.tsx');
const hideHeaderHook = fs.existsSync('src/hooks/use-hide-header-on-scroll.ts')
  ? read('src/hooks/use-hide-header-on-scroll.ts')
  : '';
const boardApi = read('src/api/board-api.ts');
const issuePulseField = read('src/components/issues/issue-pulse-field.tsx');
const issuePulseStyles = read('src/components/issues/issue-pulse-field.module.css');
const issueOverviewHook = read('src/hooks/use-issue-overview.ts');
const boardPostUtils = read('src/components/board-post/board-post-utils.ts');
const infiniteBoardHook = read('src/hooks/use-infinite-scrollable-post-list.ts');
const boardPage = read('src/app/board/page.tsx');
const boardView = read('src/sections/board/view/board-view.tsx');
const homeView = read('src/sections/home/view/home-view.tsx');
const homeStyles = read('src/sections/home/view/home-view.module.css');
const themeProvider = read('src/theme/app-theme-provider.tsx');
const oauthForm = read('src/auth/components/form-oauth.tsx');
const commentSidebar = read('src/components/comment/comment-sidebar.tsx');
const commentDrawer = read('src/components/comment/comment-drawer.tsx');
const commentSection = read('src/components/comment/comment-section.tsx');
const commentList = read('src/components/comment/comment-list.tsx');
const commentItem = read('src/components/comment/comment-item.tsx');
const commentForm = read('src/components/comment/comment-form.tsx');
const commentSkeleton = read('src/components/comment/comment-item-skeleton.tsx');
const boardButtonBlocks = [...boardView.matchAll(/<Button[\s\S]*?<\/Button>/g)].map(
  ([block]) => block
);
const handlePostSelectStart = boardView.indexOf('const handlePostSelect');
const handleCommentOpenStart = boardView.indexOf('const handleCommentOpen');
const handleCommentCloseStart = boardView.indexOf('const handleCommentClose');
const collapsedCardStart = boardView.indexOf('className="metadata-chip-row"');
const expandedPanelStart = boardView.indexOf('<Collapse in={expanded}');
const expandedActionsStart = boardView.indexOf('className="expanded-card-actions"');
const expandedActionsEnd = boardView.indexOf('</Stack>', expandedActionsStart);
const collapsedCardSource = boardView.slice(collapsedCardStart, expandedPanelStart);
const expandedActionsSource = boardView.slice(expandedActionsStart, expandedActionsEnd);
const postTagChipSource = boardView.match(/className="post-tag-chip"[\s\S]*?\/>/)?.[0] ?? '';

const redesignedFiles = [
  globalCss,
  rootLayout,
  rootPage,
  appLoading,
  appShell,
  homeView,
  homeStyles,
  boardView,
  issuePulseField,
  issuePulseStyles,
  boardPostUtils,
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

const mojibakePattern = new RegExp(
  [
    '\\?\\u317c',
    '\\?\\ubce4',
    '\\?\\ub300',
    '\\u91ab\\ub5ed',
    '\\u8adb\\u2477',
    '\\u907a\\ub348',
    '\\u5bc3\\ub6af',
    '\\u6e72\\x80',
    '\\u6e72\\u0080',
    '\\uf9cf\\uc0b5',
    '\\ufffd',
  ].join('|')
);

console.log('Verifying Board workbench redesign contract...');

assert.notEqual(handlePostSelectStart, -1, 'board view should define post selection behavior');
assert.notEqual(handleCommentOpenStart, -1, 'board view should define explicit comment opening');
assert.notEqual(handleCommentCloseStart, -1, 'board view should define comment closing');
assert.doesNotMatch(
  boardView.slice(handlePostSelectStart, handleCommentOpenStart),
  /setMobileCommentOpen\(true\)/,
  'selecting a post should not automatically open comments on mobile'
);
assert.doesNotMatch(
  boardView.slice(handlePostSelectStart, boardView.indexOf('const handleReanalyze')),
  /reanalyzeBoardPost|analyzeBoardPost/,
  'selecting a post should not trigger AI analysis'
);
assert.match(
  boardView,
  /isAdminUser && \([\s\S]*post-reanalyze-action[\s\S]*재요약/,
  'board reanalysis should only be exposed to administrators'
);
assert.match(
  boardView.slice(handleCommentOpenStart, handleCommentCloseStart),
  /handlePostSelect\(post\)[\s\S]*isContentFirstLayout[\s\S]*setMobileCommentOpen\(true\)/,
  'the explicit comment action should open comments on mobile'
);
assert.match(
  packageJson,
  /node scripts\/verify-board-ui\.mjs/,
  'repository check should run the Board UI contract'
);

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
  globalCss,
  /scrollbar-gutter:\s*stable both-edges/,
  'global CSS should reserve equal outer gutters when a vertical scrollbar is present'
);
assert.match(
  globalCss,
  /body,[\s\S]*#root[\s\S]*box-sizing:\s*border-box/,
  'body should use border-box sizing for balanced outer padding'
);
assert.match(themeProvider, /#fdfdf8/i, 'theme should use warm parchment as the app background');
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

assert.match(
  rootLayout,
  /prefers-color-scheme: light[\s\S]*#fdfdf8[\s\S]*prefers-color-scheme: dark[\s\S]*#12140f/i,
  'viewport theme color should match both application color schemes'
);
assert.match(
  appLoading,
  /loading\.gif/,
  'app initial loading should use the provided loading.gif asset'
);
assert.match(
  appLoading,
  /width=\{360\}[\s\S]*height=\{120\}/,
  'app initial loading gif should render at half of the 720x240 shape dimensions'
);
assert.match(
  appLoading,
  /app-loading-image[\s\S]*width:\s*'min\(360px, calc\(100vw - 48px\)\)'[\s\S]*height:\s*'auto'[\s\S]*objectFit:\s*'contain'/,
  'app initial loading gif should render at half size while preserving aspect ratio'
);
assert.doesNotMatch(
  appLoading,
  /width:\s*44|height:\s*44/,
  'app initial loading gif should not be forced into the old tiny square size'
);
assert.doesNotMatch(
  appLoading,
  /데이터를 불러오는 중입니다|CircularProgress/,
  'app initial loading should not show the old loading text or spinner'
);
assert.match(appShell, /Workspace/, 'app shell should keep the workspace navigation label');
assert.match(appShell, /secondary\.main/i, 'app shell hover states should use the orange accent');
assert.match(appShell, /borderColor:\s*'divider'/i, 'app shell should use themed borders');
assert.match(appShell, /background\.default/, 'app shell should use themed app background');
assert.match(
  appShell,
  /SocialLoginButtons/,
  'app shell header should own the compact Kakao login control'
);
assert.match(
  appShell,
  /header-login-actions/,
  'app shell should place login and mobile navigation in a right-aligned header action group'
);
assert.match(
  appShell,
  /component="main"[\s\S]*width:\s*'100%'[\s\S]*boxSizing:\s*'border-box'/,
  'main content should fill the body with balanced left and right padding'
);
assert.match(
  hideHeaderHook,
  /export function useHideHeaderOnScroll\(\s*enabled: boolean,\s*threshold = 64,\s*resetKey\?: string\s*\)/,
  'header scroll hook should expose the approved route-aware reset API and default threshold'
);
assert.match(
  hideHeaderHook,
  /window\.addEventListener\('scroll', handleScroll, \{ passive: true \}\)/,
  'header scroll hook should use a passive window scroll listener'
);
assert.match(
  hideHeaderHook,
  /if \(currentScrollY <= threshold\) \{\s*setHidden\(false\);/,
  'header should remain visible near the top of the page'
);
assert.match(
  hideHeaderHook,
  /if \(delta > 0\) \{\s*setHidden\(true\);[\s\S]*?else if \(delta < 0\) \{\s*setHidden\(false\);/,
  'header should hide while scrolling down and show immediately while scrolling up'
);
assert.match(
  hideHeaderHook,
  /return \(\) => window\.removeEventListener\('scroll', handleScroll\)/,
  'header scroll hook should clean up its window scroll listener'
);
assert.match(
  hideHeaderHook,
  /\}, \[enabled, resetKey, threshold\]\);/,
  'header scroll hook should reset and recapture scroll position when its route key changes'
);
assert.match(
  appShell,
  /const isBoardRoute = pathname === '\/board' \|\| pathname\.startsWith\('\/board\/'\);[\s\S]*useHideHeaderOnScroll\(isBoardRoute, 64, pathname\)/,
  'app shell should enable direction-aware hiding only for board routes and reset on navigation'
);
assert.match(
  appShell,
  /<AppBar[\s\S]*className="app-header"/,
  'app bar should expose the app-header class'
);
assert.match(
  appShell,
  /transform:\s*headerHidden \? 'translateY\(-100%\)' : 'translateY\(0\)'/,
  'app bar should move off-canvas without changing document flow'
);
assert.match(
  appShell,
  /'&:focus-within':\s*\{\s*transform:\s*'translateY\(0\)'/,
  'keyboard focus within the app bar should always reveal it'
);
assert.match(
  appShell,
  /transition:\s*\(theme\)\s*=>\s*theme\.transitions\.create\(\s*'transform',\s*\{\s*duration:\s*theme\.transitions\.duration\.shorter,?\s*\}\s*\)/,
  'app bar should animate its transform with the theme shorter transition'
);
assert.match(
  appShell,
  /'@media \(prefers-reduced-motion: reduce\)':\s*\{[\s\S]*?transition:\s*'none'/,
  'app bar should disable its transform animation when reduced motion is preferred'
);

assert.match(boardView, /BoardWorkbench/, 'board view should expose a workbench container');
assert.match(
  boardView,
  /className="BoardWorkbenchFrame"[\s\S]*alignItems:\s*'center'[\s\S]*width:\s*'100%'/,
  'board frame should center fixed-width workbench content on wide screens'
);
assert.match(boardView, /renderToolPane/, 'board view should render a dedicated left tool pane');
assert.match(boardView, /renderFeedHeader/, 'board view should render a feed header');
assert.match(
  boardView,
  /PostCardSkeleton[\s\S]*Skeleton/,
  'initial board feed loading should restore the post card skeleton'
);
assert.match(
  boardView,
  /initialLoading[\s\S]*Array\.from\(\{ length: 5 \}\)[\s\S]*<PostCardSkeleton/,
  'initial board feed loading should render the restored skeleton list'
);
assert.match(
  boardView,
  /renderCommentEmptyState/,
  'board view should keep a stable right-pane empty state'
);
assert.match(
  boardView,
  /gridTemplateColumns/,
  'desktop board should use explicit workbench columns'
);
assert.match(
  boardView,
  /const workbenchSideColumnWidth = 320;/,
  'desktop board should define one shared side column width'
);
assert.match(
  boardView,
  /gridTemplateColumns:\s*`\$\{workbenchSideColumnWidth\}px minmax\(0, 1fr\) \$\{workbenchSideColumnWidth\}px`/,
  'desktop board should keep the first and third columns equal so the feed stays centered'
);
assert.match(
  boardView,
  /const isTabletContentViewport = useMediaQuery\(\s*'\(any-pointer: coarse\) and \(min-width: 900px\) and \(max-width: 1400px\)'\s*\);[\s\S]*const isContentFirstLayout = isMobile \|\| isTabletContentViewport;/,
  'iPad Pro-sized touch-capable screens should use the content-first board layout'
);
assert.match(
  boardView,
  /display:\s*isContentFirstLayout \? 'block' : 'grid'/,
  'content-first devices should collapse the board workbench to a single content column'
);
assert.match(
  boardView,
  /display:\s*isContentFirstLayout \? 'none' : 'block'/,
  'content-first devices should hide desktop side panes'
);
const feedHeaderStart = boardView.indexOf('const renderFeedHeader');
const toolPaneStart = boardView.indexOf('const renderToolPane');

assert.notEqual(feedHeaderStart, -1, 'board view should define the feed header');
assert.notEqual(toolPaneStart, -1, 'board view should define the desktop tool pane');

const feedHeaderSource = boardView.slice(feedHeaderStart, toolPaneStart);

assert.match(
  feedHeaderSource,
  /className="filter-icon-button"[\s\S]*selectedSites\.map[\s\S]*필터 초기화/,
  'content-first devices should keep board filters available in the always-rendered feed header'
);
assert.doesNotMatch(
  boardView,
  /const renderFilters/,
  'board filters should not use a standalone responsive card'
);
assert.doesNotMatch(
  boardView,
  /\{isContentFirstLayout && renderFilters\}/,
  'content-first feed should not render a standalone filter card'
);
const sideImageSlotStart = boardView.indexOf('const renderSideImageSlot');
const postCardReturnStart = boardView.indexOf('  return (', sideImageSlotStart);

assert.notEqual(sideImageSlotStart, -1, 'board post card should define the side image slot');
assert.notEqual(
  postCardReturnStart,
  -1,
  'board post card should render after defining the side image slot'
);

const sideImageSlotSource = boardView.slice(sideImageSlotStart, postCardReturnStart);

assert.equal(
  (sideImageSlotSource.match(/height: \{ xs: 72, sm: 96 \}/g) ?? []).length,
  2,
  'image and fallback slots should use fixed responsive square heights'
);
assert.equal(
  (sideImageSlotSource.match(/alignSelf: 'flex-start'/g) ?? []).length,
  2,
  'image and fallback slots should not stretch with card content'
);
assert.doesNotMatch(
  sideImageSlotSource,
  /minHeight: \{ xs: 72, sm: 96 \}|alignSelf: 'stretch'/,
  'side image slots should not use stretchable minimum heights'
);
assert.match(
  sideImageSlotSource,
  /objectFit: 'cover'/,
  'list thumbnail should crop inside its fixed slot'
);
assert.match(
  boardView,
  /open=\{imageOpen\}[\s\S]*maxHeight: '86vh'[\s\S]*objectFit: 'contain'/,
  'full-image dialog should continue to show the complete image'
);
assert.match(
  boardView,
  /open=\{isContentFirstLayout && mobileCommentOpen\}/,
  'content-first devices should use the comment drawer instead of the desktop sidebar'
);
assert.match(
  boardView,
  /width:\s*'min\(100%, 1536px\)'[\s\S]*boxSizing:\s*'border-box'[\s\S]*mx:\s*'auto'/,
  'board workbench should use one centered width so both outer gutters stay equal'
);
assert.doesNotMatch(
  boardView,
  /gridTemplateColumns:\s*selectedPost/,
  'desktop board columns should not change width when a post is selected'
);
assert.match(
  boardView,
  /onPostSelect/,
  'post cards should support selecting a post separately from opening expanded actions'
);
assert.match(
  boardView,
  /expanded-card-close/,
  'expanded cards should expose a top-right close control'
);
assert.match(
  boardView,
  /expanded-card-actions/,
  'expanded cards should place source and comment actions at the bottom'
);
assert.match(
  boardView,
  /quiet-list-card/,
  'post cards should use the approved quiet list-card layout'
);
assert.match(
  boardView,
  /compact-site-marker/,
  'collapsed cards should use a compact site marker instead of a large placeholder'
);
assert.match(
  boardView,
  /card-side-image-slot/,
  'collapsed cards should use the removed expansion control space to expand the post image'
);
assert.doesNotMatch(
  boardView,
  /collapsed-expand-indicator|ExpandMoreIcon|card-footer-image-slot/,
  'collapsed cards should not render the old expansion indicator icon or a tiny footer image slot'
);
assert.match(
  boardPostUtils,
  /export function resolveThumbnailSrc/,
  'board cards should use a shared thumbnail resolver'
);
assert.match(
  boardPostUtils,
  /\^https\?:\\\/\\\//,
  'thumbnail resolver should detect absolute metadata URLs'
);
assert.match(
  boardPostUtils,
  /CONFIG\.imageServerUrl/,
  'thumbnail resolver should prefix relative media paths'
);
assert.match(
  boardPostUtils,
  /replace\(\s*\/\^\\\/\+\//,
  'thumbnail resolver should strip leading slashes from relative media paths before prefixing'
);
assert.match(
  boardView,
  /import \{ getPostSummary, resolveThumbnailSrc \} from 'src\/components\/board-post\/board-post-utils'/,
  'board view should consume the shared summary and thumbnail rules'
);
assert.match(
  boardView,
  /const resolvedThumbnailSrc = resolveThumbnailSrc\(post\.thumbnail\)/,
  'post cards should resolve thumbnails through the shared resolver'
);
assert.match(
  boardPostUtils,
  /icon_app_20160427\.png[\s\S]*cdn_img_404\.jpg[\s\S]*m3u8\|m4v\|mov\|mp4\|webm/,
  'thumbnail resolver should reject placeholder images and video metadata'
);
assert.match(
  boardView,
  /const \[thumbnailFailed, setThumbnailFailed\] = useState\(false\)[\s\S]*onError=\{handleThumbnailError\}/,
  'failed image requests should fall back to the non-image site marker'
);
assert.doesNotMatch(
  boardView,
  /<Typography variant="h6"[\s\S]*실시간 게시판[\s\S]*<\/Typography>[\s\S]*<Stack spacing=\{1\}>/,
  'board tool pane should not repeat the realtime board title under the workspace label'
);
assert.match(
  boardApi,
  /export type BoardListFilters/,
  'board API should expose reusable list filters'
);
assert.match(
  boardApi,
  /URLSearchParams/,
  'board API should build filtered list URLs through URLSearchParams'
);
assert.match(
  boardApi,
  /filters\.sites\?\.forEach/,
  'board API should support repeated site filters'
);
assert.match(boardApi, /hasThumbnail/, 'board API should support thumbnail-presence filtering');
assert.match(
  infiniteBoardHook,
  /filters:\s*BoardListFilters/,
  'infinite board hook should accept board list filters'
);
assert.match(
  infiniteBoardHook,
  /analysisStatus === 'pending'[\s\S]*analysisStatus === 'processing'[\s\S]*refetchInterval/,
  'realtime boards should refresh automatically while background summaries are active'
);
assert.match(
  infiniteBoardHook,
  /realtimePagination:\s*queryData\?\.pages\.flat\(\)/,
  'realtime feed pages should retain the API-provided site-diversified order'
);
assert.doesNotMatch(
  infiniteBoardHook,
  /queryData\?\.pages[\s\S]{0,160}\.sort\(/,
  'realtime feed should not re-sort the API-provided ranking in the client'
);
assert.match(
  boardView,
  /postData\.map\(\(post\) =>/,
  'board cards should render directly in the ranked order supplied by the board hook'
);
assert.match(
  boardApi,
  /getIssueOverview[\s\S]*\/boardservice\/api\/boards\/issues/,
  'board API should expose the recent AI tag overview'
);
assert.match(
  issueOverviewHook,
  /getIssueOverview\(\{ hours: 24, limit: 16, sites: stableSites \}\)/,
  'issue overview should refresh the 24-hour visualization in the selected site scope'
);
assert.match(
  issuePulseField,
  /overview\?\.tags\.slice[\s\S]*tag\.impactScore/,
  'tag briefing should render the AI tag impact ranking'
);
assert.match(
  issuePulseField,
  /onTagSelect\(selected \? undefined : tag\.tag\)/,
  'tag rows should toggle tag selection'
);
assert.match(
  issuePulseStyles,
  /\.impactTrack[\s\S]*--tag-impact/,
  'tag briefing should visualize relative impact without animated bubbles'
);
assert.match(
  rootPage,
  /<AppShell>[\s\S]*<HomeView/,
  'the root route should render the issue overview home page'
);
assert.doesNotMatch(
  rootPage,
  /redirect\(['"]\/board['"]\)/,
  'the root route should not redirect to the board'
);
assert.match(
  homeView,
  /useIssueOverview\(\)[\s\S]*<TagBriefing/,
  'the AI tag briefing should load on the root home view'
);
assert.match(
  homeView,
  /useTopBoards\(\)[\s\S]*onRankSelect=\{setSelectedRank\}[\s\S]*role="tablist"/,
  'the home page should let visitors preview live Top 10 stories'
);
assert.match(
  homeView,
  /href=\{`\/top10\?rank=\$\{activeRank \+ 1\}`\}/,
  'the selected home story should retain a rank-aware Top 10 deep link'
);
assert.match(
  homeView,
  /<TagBriefing[\s\S]*onTagSelect=\{handleTagSelect\}/,
  'the home tag index should open boards through AI tag selection'
);
assert.match(
  homeStyles,
  /\.hero[\s\S]*\.statsBand[\s\S]*\.methodNote[\s\S]*\.storiesGrid/,
  'the home experience should use an editorial data-first layout'
);
assert.match(
  homeView,
  /router\.push\(`\/board\?\$\{query\.toString\(\)\}`\)/,
  'selecting a home AI tag should open the filtered board'
);
assert.doesNotMatch(
  boardView,
  /<TagBriefing/,
  'the tag briefing should not render inside the board page'
);
assert.match(
  boardPage,
  /initialCategory=\{parseFilter\(category\)\}[\s\S]*initialTag=\{parseFilter\(tag\)\}/,
  'the board page should apply category and AI tag filters from the URL'
);
assert.doesNotMatch(
  boardView,
  /onClick=\{handleExpand\}/,
  'collapsed expansion affordance should not render as a clickable button'
);
assert.doesNotMatch(
  boardView,
  /borderColor:\s*selected\s*\?\s*'#e7b89a'\s*:\s*'transparent'/,
  'collapsed comment count should not show a selected button-like border'
);
assert.doesNotMatch(
  boardView,
  /color:\s*selected\s*\?\s*'#F54E00'\s*:\s*'#65675e'/,
  'collapsed comment count should not turn into a selected button-like accent'
);
assert.doesNotMatch(
  boardView,
  /&:hover \.post-card-action/,
  'hovering the card should not activate child action button styling'
);
assert.match(
  boardView,
  /expanded-summary-panel/,
  'expanded content should be contained in a quiet summary panel'
);
assert.doesNotMatch(
  boardView,
  /expanded-summary-panel[\s\S]*tags\.map/,
  'expanded summary panel should not repeat post tag chips'
);
assert.doesNotMatch(
  boardView,
  /width:\s*\{\s*xs:\s*72,\s*sm:\s*82\s*\}/,
  'collapsed cards should not use the old large 72/82px placeholder block'
);
assert.match(
  boardView,
  /handleCardClick/,
  'post card clicks should have a dedicated click handler'
);
assert.match(
  boardView,
  /metadata-chip-row[\s\S]*post\.siteLabel[\s\S]*tags\.map/,
  'post tag chips should sit on the same metadata row as the site chip'
);
assert.match(postTagChipSource, /variant="filled"/, 'post tag chips should use a filled surface');
assert.match(
  postTagChipSource,
  /height:\s*18[\s\S]*bgcolor:\s*'#34372f'[\s\S]*color:\s*'common\.white'/,
  'post tag chips should use a compact dark surface with white text'
);
assert.match(
  postTagChipSource,
  /fontSize:\s*'0\.6875rem'[\s\S]*px:\s*0\.625/,
  'post tag chips should use compact text and horizontal padding'
);
assert.doesNotMatch(
  postTagChipSource,
  /background\.warm|secondary\.dark/,
  'post tag chips should not use the attention-grabbing orange treatment'
);
assert.doesNotMatch(
  collapsedCardSource,
  /onClick=\{handleLike\}/,
  'collapsed post cards should not expose an interactive like action'
);
assert.match(
  collapsedCardSource,
  /FavoriteBorderIcon[\s\S]*label=\{`\$\{currentLikeCount\}`\}/,
  'collapsed post cards should show a read-only like count'
);
assert.match(
  expandedActionsSource,
  /expanded-like-action[\s\S]*FavoriteBorderIcon[\s\S]*onClick=\{handleLike\}[\s\S]*좋아요 \{currentLikeCount\}[\s\S]*원문 바로가기/,
  'expanded posts should place the interactive like action before the source link'
);
assert.match(boardView, /filter-icon-button/, 'site filtering should be opened by an icon button');
assert.doesNotMatch(
  boardView,
  /SocialLoginButtons/,
  'board tool pane should not render the Kakao login button after it moves to the header'
);
assert.equal(
  boardButtonBlocks.some(
    (block) => block.includes('setSiteMenuAnchor') || block.includes('사이트 필터')
  ),
  false,
  'site filtering should not use a large text button as the click target'
);
assert.match(
  boardView,
  /const handleCardClick = \(\) => \{[\s\S]*setExpanded\(true\)[\s\S]*onPostSelect\(post\)/,
  'post card clicks should expand the post and select its comments'
);
assert.doesNotMatch(
  boardView,
  /const handleCardClick = \(\) => \{[\s\S]*setExpanded\(\(open\) => !open\)/,
  'post card clicks should not toggle/collapse an already expanded post'
);
assert.match(
  boardView,
  /boardContentsQueryError && !postData\.length/,
  'board error banner should only show when the initial feed is empty'
);
assert.match(boardView, /실시간 게시판/, 'board title copy should be valid Korean');
assert.match(boardView, /필터 초기화/, 'filter reset copy should be valid Korean');
assert.match(boardView, /게시글이 없습니다/, 'empty feed copy should be valid Korean');
assert.match(
  boardView,
  /secondary\.main|--mui-palette-secondary-main/i,
  'post cards should use themed orange selected or hover accents'
);
assert.match(
  boardView,
  /background\.subtle/i,
  'post cards and filters should use themed subtle surfaces'
);

assert.match(oauthForm, /kakao-login-button/, 'Kakao login should expose a compact button class');
assert.match(oauthForm, /kakao-login-image/, 'Kakao login should render the provided image asset');
assert.match(
  oauthForm,
  /\/kakao_login_small\.png/,
  'Kakao login should use the small public Kakao asset'
);
assert.doesNotMatch(oauthForm, /ChatBubbleIcon/, 'Kakao login should not use the fallback icon');
assert.doesNotMatch(oauthForm, /fullWidth/, 'header login button should not use full-width layout');
assert.doesNotMatch(
  oauthForm,
  /size="large"/,
  'header login button should not use the large CTA size'
);
assert.match(
  commentSidebar,
  /background\.subtle/i,
  'comment sidebar should use themed panel surface'
);
assert.match(
  commentDrawer,
  /background\.subtle/i,
  'comment drawer should use themed panel surface'
);
assert.match(
  commentSection,
  /background\.subtle|background\.default|background\.paper/i,
  'comment section should use themed surfaces'
);
assert.match(
  commentList,
  /첫 댓글을 남겨보세요/,
  'comment empty state should keep valid Korean copy'
);
assert.match(commentItem, /secondary\.main/i, 'comment actions should use themed hover accents');
assert.match(
  commentForm,
  /primary\.main/i,
  'comment submit buttons should use themed primary style'
);
assert.match(
  commentSkeleton,
  /background\.subtle|background\.default|background\.paper/i,
  'comment skeleton should use sage-themed surfaces'
);

assert.doesNotMatch(
  redesignedFiles,
  mojibakePattern,
  'redesigned UI files should not contain visible mojibake strings'
);
assert.doesNotMatch(
  redesignedFiles,
  /#00A76F/i,
  'redesigned UI files should not use the legacy green accent'
);
assert.doesNotMatch(
  redesignedFiles,
  /#8E33FF/i,
  'redesigned UI files should not use the legacy purple accent'
);

console.log('Board workbench redesign contract passed.');
