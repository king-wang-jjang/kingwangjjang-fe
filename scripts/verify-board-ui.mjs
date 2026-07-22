import fs from 'fs';
import assert from 'assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');

const packageJson = read('package.json');
const globalCss = read('src/global.css');
const rootLayout = read('src/app/layout.tsx');
const appLoading = read('src/app/loading.tsx');
const appShell = read('src/layouts/app-shell.tsx');
const boardApi = read('src/api/board-api.ts');
const boardPostUtils = read('src/components/board-post/board-post-utils.ts');
const infiniteBoardHook = read('src/hooks/use-infinite-scrollable-post-list.ts');
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
const boardButtonBlocks = [...boardView.matchAll(/<Button[\s\S]*?<\/Button>/g)].map(
  ([block]) => block
);
const handlePostSelectStart = boardView.indexOf('const handlePostSelect');
const handleCommentOpenStart = boardView.indexOf('const handleCommentOpen');
const handleCommentCloseStart = boardView.indexOf('const handleCommentClose');

const redesignedFiles = [
  globalCss,
  rootLayout,
  appLoading,
  appShell,
  boardView,
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
assert.match(
  boardView.slice(handleCommentOpenStart, handleCommentCloseStart),
  /handlePostSelect\(post\)[\s\S]*isContentFirstLayout[\s\S]*setMobileCommentOpen\(true\)/,
  'the explicit comment action should open comments on mobile'
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

assert.match(rootLayout, /themeColor:\s*'#fdfdf8'/i, 'viewport theme color should match parchment');
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
assert.match(appShell, /#F54E00/i, 'app shell hover states should flash orange');
assert.match(appShell, /#bfc1b7/i, 'app shell should use sage borders');
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
assert.match(boardView, /#F54E00/i, 'post cards should use orange selected or hover accents');
assert.match(boardView, /#eeefe9/i, 'post cards and filters should use sage cream surfaces');

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
assert.match(commentSidebar, /#eeefe9/i, 'comment sidebar should use sage panel surface');
assert.match(commentDrawer, /#eeefe9/i, 'comment drawer should use sage panel surface');
assert.match(
  commentSection,
  /#eeefe9|background\.default|background\.paper/i,
  'comment section should use themed surfaces'
);
assert.match(
  commentList,
  /첫 댓글을 남겨보세요/,
  'comment empty state should keep valid Korean copy'
);
assert.match(commentItem, /#F54E00/i, 'comment actions should use orange hover accents');
assert.match(commentForm, /#1e1f23/i, 'comment submit buttons should use the dark primary style');
assert.match(
  commentSkeleton,
  /#eeefe9|background\.default|background\.paper/i,
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
