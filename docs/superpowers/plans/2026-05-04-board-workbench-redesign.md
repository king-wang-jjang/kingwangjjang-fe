# Board Workbench Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/board` into the approved warm, olive/sage, PostHog-inspired reading workbench while preserving existing board, auth, and comment behavior.

**Architecture:** Keep the current Next.js App Router and MUI 5 stack. Translate `DESIGN.md` into MUI theme tokens, global font loading, app shell styling, a three-pane board layout, and restyled comment components. Use the existing hooks/stores/API clients without contract changes.

**Tech Stack:** Next.js 14, React 18, TypeScript, MUI 5, Emotion `sx`, Zustand, REST API hooks, `scripts/verify-board-ui.mjs`, `npm run ts`, `npm run lint`, `npm run build`.

---

## File Structure

- Modify: `package.json`
  - Add `@fontsource-variable/ibm-plex-sans` if it is not already present.
- Modify: `yarn.lock` and possibly `package-lock.json`
  - Keep the repo's existing lockfile situation intact. If using Yarn, update `yarn.lock`; if `package-lock.json` is already tracked and dirty, preserve its existing changes and update only if the package manager command does so.
- Modify: `src/global.css`
  - Import IBM Plex Sans Variable and set the warm parchment body background.
- Modify: `src/theme/app-theme-provider.tsx`
  - Define the warm palette, compact radius, typography, focus, button, card, paper, chip, menu, drawer, skeleton, and text field overrides.
- Modify: `src/app/layout.tsx`
  - Update viewport theme color while preserving existing `QueryProvider`, `AuthInitializer`, `AppThemeProvider`, and `Toaster` composition.
- Modify: `src/layouts/app-shell.tsx`
  - Restyle the top shell and navigation for the new workbench.
- Modify: `src/sections/board/view/board-view.tsx`
  - Convert the desktop board into the approved three-pane workbench and replace visible mojibake copy with valid Korean.
- Modify: `src/auth/components/form-oauth.tsx`
  - Restyle the Kakao login entry so it sits cleanly inside the left pane.
- Modify: `src/components/comment/comment-sidebar.tsx`
  - Restyle the sticky desktop comment pane.
- Modify: `src/components/comment/comment-drawer.tsx`
  - Restyle the mobile drawer while preserving bottom drawer behavior.
- Modify: `src/components/comment/comment-section.tsx`
  - Adjust spacing to match the new panel surfaces.
- Modify: `src/components/comment/comment-list.tsx`
  - Restyle loading and empty states.
- Modify: `src/components/comment/comment-item.tsx`
  - Restyle comment cards, reply indentation, action controls, and hover states.
- Modify: `src/components/comment/comment-form.tsx`
  - Restyle composer and reply inputs/buttons.
- Modify: `src/components/comment/comment-item-skeleton.tsx`
  - Restyle skeletons to sage surfaces.
- Modify: `scripts/verify-board-ui.mjs`
  - Replace legacy white/green assertions with the new board workbench design contract.

## Task 1: Write The Red Design Contract

**Files:**
- Modify: `scripts/verify-board-ui.mjs`

- [ ] **Step 1: Replace `scripts/verify-board-ui.mjs` with the new failing contract**

Use this complete file content:

```js
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
```

- [ ] **Step 2: Run the contract and verify it fails for the expected reason**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: FAIL. The first failure should mention missing `@fontsource-variable/ibm-plex-sans` or another new design-contract requirement. If it passes immediately, the contract is not testing the redesign and must be tightened before continuing.

- [ ] **Step 3: Commit the red contract**

```bash
git add scripts/verify-board-ui.mjs
git commit -m "test: define board workbench redesign contract"
```

## Task 2: Install Font And Theme Tokens

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock`
- Modify: `package-lock.json` if the chosen package manager updates it
- Modify: `src/global.css`
- Modify: `src/theme/app-theme-provider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add IBM Plex Sans Variable**

Run:

```bash
yarn add @fontsource-variable/ibm-plex-sans
```

Expected: `package.json` includes `@fontsource-variable/ibm-plex-sans`, and `yarn.lock` is updated. If `package-lock.json` is already dirty before this task, inspect it with `git diff -- package-lock.json` and preserve unrelated changes.

- [ ] **Step 2: Update `src/global.css` font import and background**

Replace the existing Inter import:

```css
@import '@fontsource-variable/inter';
```

with:

```css
@import '@fontsource-variable/ibm-plex-sans';
```

Then change the `body, #root` font and background block to:

```css
body,
#root {
  display: flex;
  flex: 1 1 auto;
  margin: 0;
  min-height: 100%;
  flex-direction: column;
  background: #fdfdf8;
  color: #4d4f46;
  font-family:
    'IBM Plex Sans Variable',
    'IBM Plex Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
```

- [ ] **Step 3: Replace the MUI theme token definitions**

In `src/theme/app-theme-provider.tsx`, keep the imports and component shape, but replace the object passed to `createTheme` with a warm MUI theme using these exact token values:

```ts
createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e1f23',
      light: '#4d4f46',
      dark: '#111827',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F54E00',
      light: '#F7A501',
      dark: '#b17816',
      contrastText: '#ffffff',
    },
    error: { main: '#F54E00' },
    warning: { main: '#b17816' },
    success: { main: '#4d4f46' },
    background: {
      default: '#fdfdf8',
      paper: '#fdfdf8',
    },
    text: {
      primary: '#4d4f46',
      secondary: '#65675e',
    },
    divider: '#bfc1b7',
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily:
      '"IBM Plex Sans Variable", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { color: '#23251d', fontWeight: 800, letterSpacing: 0, lineHeight: 1.2 },
    h5: { color: '#23251d', fontWeight: 800, letterSpacing: 0, lineHeight: 1.28 },
    h6: { color: '#23251d', fontWeight: 700, letterSpacing: 0, lineHeight: 1.4 },
    subtitle1: { fontWeight: 700, lineHeight: 1.4 },
    body1: { lineHeight: 1.56 },
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 700, letterSpacing: 0, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fdfdf8',
          color: '#4d4f46',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            color: '#F54E00',
          },
          '&:active': {
            transform: 'scale(0.99)',
          },
          '&.MuiButton-contained': {
            backgroundColor: '#1e1f23',
            color: '#ffffff',
            borderRadius: 6,
            '&:hover': {
              backgroundColor: '#1e1f23',
              color: '#F7A501',
              opacity: 0.72,
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#bfc1b7',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderColor: '#bfc1b7',
          borderRadius: 4,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation8: {
          boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: '#bfc1b7',
          borderRadius: 9999,
          fontWeight: 700,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&:hover': {
            color: '#F54E00',
            backgroundColor: '#f4f4f4',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#eeefe9',
          borderRadius: 4,
          '& fieldset': { borderColor: '#b6b7af' },
          '&:hover fieldset': { borderColor: '#bfc1b7' },
          '&.Mui-focused fieldset': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: '#eeefe9',
        },
      },
    },
  },
})
```

- [ ] **Step 4: Update viewport color**

In `src/app/layout.tsx`, change:

```ts
themeColor: '#00A76F',
```

to:

```ts
themeColor: '#fdfdf8',
```

Do not remove `QueryProvider`, `AuthInitializer`, `AppThemeProvider`, or `Toaster`.

- [ ] **Step 5: Run the design contract**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: FAIL remains, but the font/theme assertions should now pass. Remaining failures should point to shell, board, and comment components.

- [ ] **Step 6: Commit theme work**

```bash
git add package.json yarn.lock package-lock.json src/global.css src/theme/app-theme-provider.tsx src/app/layout.tsx
git commit -m "style: add warm board design system theme"
```

If `package-lock.json` was not modified by the package manager command, omit it from `git add`.

## Task 3: Redesign The App Shell And Login Entry

**Files:**
- Modify: `src/layouts/app-shell.tsx`
- Modify: `src/auth/components/form-oauth.tsx`

- [ ] **Step 1: Restyle shell constants and surfaces**

In `src/layouts/app-shell.tsx`, keep `drawerWidth` and `headerHeight`, then update shell `sx` values to use:

```ts
const drawerWidth = 236;
const headerHeight = 58;
```

For the root shell, use:

```tsx
<Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
```

For the `AppBar`, use these key styles:

```ts
sx={{
  zIndex: (theme) => theme.zIndex.drawer + 1,
  color: 'text.primary',
  bgcolor: 'background.default',
  borderBottom: 1,
  borderColor: '#bfc1b7',
  boxShadow: 'none',
}}
```

- [ ] **Step 2: Restyle navigation item selected and hover states**

In `SidebarContent`, update `ListItemButton` styles so selected state uses sage surfaces rather than legacy primary fill:

```ts
sx={{
  mb: 0.5,
  borderRadius: 1,
  minHeight: 40,
  color: selected ? '#23251d' : 'text.primary',
  border: 1,
  borderColor: selected ? '#bfc1b7' : 'transparent',
  bgcolor: selected ? '#e5e7e0' : 'transparent',
  '&:hover': {
    bgcolor: '#f4f4f4',
    color: '#F54E00',
    '& .MuiListItemIcon-root': {
      color: '#F54E00',
    },
  },
  '&.Mui-selected': {
    bgcolor: '#e5e7e0',
    color: '#23251d',
    '& .MuiListItemIcon-root': {
      color: '#23251d',
    },
    '&:hover': {
      bgcolor: '#f4f4f4',
      color: '#F54E00',
    },
  },
}}
```

- [ ] **Step 3: Restyle main content spacing**

Use compact workbench spacing:

```ts
sx={{
  px: { xs: 1.5, sm: 2, md: 3 },
  py: { xs: 1.5, md: 2 },
  pt: {
    xs: `${headerHeight + 16}px`,
    md: `${headerHeight + 20}px`,
  },
}}
```

- [ ] **Step 4: Restyle Kakao login CTA**

In `src/auth/components/form-oauth.tsx`, keep the click handler and URL logic. Change the button `variant` to `contained`, keep text `카카오 로그인`, and use:

```ts
sx={{
  py: 1,
  px: 1.5,
  bgcolor: '#1e1f23',
  color: '#ffffff',
  borderColor: '#1e1f23',
  borderRadius: 1.5,
  fontWeight: 800,
  '&:hover': {
    bgcolor: '#1e1f23',
    color: '#F7A501',
    opacity: 0.72,
  },
}}
```

- [ ] **Step 5: Run the design contract**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: FAIL remains, but shell and login assertions should pass.

- [ ] **Step 6: Commit shell work**

```bash
git add src/layouts/app-shell.tsx src/auth/components/form-oauth.tsx
git commit -m "style: redesign board app shell"
```

## Task 4: Build The Board Workbench Layout

**Files:**
- Modify: `src/sections/board/view/board-view.tsx`

- [ ] **Step 1: Add stable helper names used by the design contract**

Inside `BoardView`, organize render blocks with these names:

```tsx
const renderFeedHeader = (
  <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5">실시간 게시판</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            수집된 게시글을 빠르게 훑고 댓글 흐름을 확인하세요.
          </Typography>
        </Box>
        <Chip
          label={`${filteredPosts.length}개 게시글`}
          size="small"
          sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
        />
      </Stack>
    </CardContent>
  </Card>
);

const renderCommentEmptyState = (
  <Card sx={{ minHeight: 240, bgcolor: '#eeefe9', borderColor: '#bfc1b7', borderRadius: 1 }}>
    <CardContent
      sx={{
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Box>
        <Typography variant="h6">댓글을 보려면 게시글을 선택하세요.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          게시글을 열면 이 영역에서 댓글을 바로 확인할 수 있습니다.
        </Typography>
      </Box>
    </CardContent>
  </Card>
);
```

The names must appear exactly so `scripts/verify-board-ui.mjs` can assert the workbench structure. `renderToolPane` is defined in the next step because it contains the full filter and login controls.

- [ ] **Step 2: Replace the desktop grid with explicit workbench columns**

Use a named wrapping element:

```tsx
<Box
  className="BoardWorkbench"
  sx={{
    display: { xs: 'block', md: 'grid' },
    gridTemplateColumns: selectedPost ? '236px minmax(0, 1fr) 360px' : '236px minmax(0, 1fr) 320px',
    gap: 1.5,
    alignItems: 'start',
  }}
>
  <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 78 }}>
    {renderToolPane}
  </Box>
  <Stack spacing={1.25} sx={{ minWidth: 0 }}>
    {renderFeedHeader}
    {isMobile && renderFilters}
    {renderPostList}
  </Stack>
  <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 78 }}>
    {selectedPost ? (
      <CommentSidebar
        postId={selectedPost.boardId}
        site={selectedPost.site}
        title="댓글"
        onClose={handleCommentClose}
      />
    ) : (
      renderCommentEmptyState
    )}
  </Box>
</Box>
```

- [ ] **Step 3: Move desktop filters into the left tool pane**

`renderToolPane` should include:

```tsx
const renderToolPane = (
  <Card sx={{ bgcolor: '#eeefe9', borderColor: '#bfc1b7', borderRadius: 1 }}>
    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Typography variant="overline" sx={{ color: '#65675e', fontWeight: 800 }}>
        Workspace
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, mb: 1.5 }}>
        실시간 게시판
      </Typography>

      <Box sx={{ mb: 1.5 }}>
        <SocialLoginButtons />
      </Box>

      <Divider sx={{ my: 1.5, borderColor: '#bfc1b7' }} />

      <Stack spacing={1}>
        <Typography variant="overline" sx={{ color: '#65675e', fontWeight: 800 }}>
          Sites
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          endIcon={
            <Badge color="secondary" variant="dot" invisible={!selectedSites.length}>
              <FilterListIcon />
            </Badge>
          }
          onClick={(event) => setSiteMenuAnchor(event.currentTarget)}
          sx={{
            justifyContent: 'space-between',
            bgcolor: '#fdfdf8',
            borderColor: '#bfc1b7',
            color: '#4d4f46',
            '&:hover': { color: '#F54E00', borderColor: '#bfc1b7', bgcolor: '#f4f4f4' },
          }}
        >
          사이트 필터
        </Button>

        {!!selectedSites.length && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {selectedSites.map((site) => (
              <Chip
                key={site}
                size="small"
                label={site}
                onDelete={() => handleToggleSite(site)}
                sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
              />
            ))}
          </Stack>
        )}

        {!!selectedSites.length && (
          <Button color="inherit" size="small" onClick={() => setSelectedSites([])}>
            필터 초기화
          </Button>
        )}
      </Stack>
    </CardContent>
  </Card>
);
```

Keep the existing `selectedSites`, `siteMenuAnchor`, `handleToggleSite`, and reset behavior.

- [ ] **Step 4: Replace mojibake user-facing board copy**

Use these visible strings in `board-view.tsx`:

```ts
title = '실시간 게시판'
'필터 초기화'
'사이트 정보 없음'
'전체 보기'
'게시글이 없습니다'
'필터를 초기화하거나 새 게시글이 수집될 때까지 기다려 주세요.'
'게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
'댓글'
'댓글을 보려면 게시글을 선택하세요.'
'요약 내용이 없습니다.'
'로그인이 필요합니다.'
'좋아요 추가 실패'
'방금'
'분 전'
'시간 전'
'일 전'
'원문'
'요약 열기'
'요약 닫기'
'이미지 닫기'
```

- [ ] **Step 5: Restyle post cards**

Keep `BoardPostCard` behavior. Change surfaces to:

```ts
borderColor: selected ? '#F54E00' : '#bfc1b7',
bgcolor: readStatus ? '#eeefe9' : '#ffffff',
borderRadius: 1,
transition: 'transform 180ms ease, border-color 160ms ease, background-color 160ms ease',
```

For titles:

```ts
color: readStatus ? '#4d4f46' : '#23251d',
fontWeight: readStatus ? 700 : 800,
lineHeight: 1.38,
```

For hover:

```ts
'&:hover .post-card-title, &:hover .post-card-action': {
  color: '#F54E00',
}
```

- [ ] **Step 6: Restyle loading, empty, and image dialog states**

Use sage skeleton surfaces, a bordered empty card, and the single deep shadow for `Dialog` paper:

```tsx
<Dialog
  open={imageOpen}
  onClose={() => setImageOpen(false)}
  maxWidth="lg"
  PaperProps={{ sx: { boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)', borderRadius: 1 } }}
>
```

- [ ] **Step 7: Run the design contract**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: FAIL remains only for comment component assertions.

- [ ] **Step 8: Commit board work**

```bash
git add src/sections/board/view/board-view.tsx
git commit -m "feat: redesign board as reading workbench"
```

## Task 5: Redesign Comments For The Workbench

**Files:**
- Modify: `src/components/comment/comment-sidebar.tsx`
- Modify: `src/components/comment/comment-drawer.tsx`
- Modify: `src/components/comment/comment-section.tsx`
- Modify: `src/components/comment/comment-list.tsx`
- Modify: `src/components/comment/comment-item.tsx`
- Modify: `src/components/comment/comment-form.tsx`
- Modify: `src/components/comment/comment-item-skeleton.tsx`

- [ ] **Step 1: Restyle `CommentSidebar` panel**

Keep `useComments` and desktop-only behavior. Use:

```ts
sx={{
  position: 'sticky',
  top: '78px',
  height: 'calc(100vh - 94px)',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: '#eeefe9',
  borderColor: '#bfc1b7',
  borderRadius: 1,
  overflow: 'hidden',
  ...sx,
}}
```

Header:

```ts
sx={{
  px: 1.5,
  py: 1.25,
  borderBottom: 1,
  borderColor: '#bfc1b7',
  bgcolor: '#eeefe9',
}}
```

Footer:

```ts
sx={{ borderTop: 1, borderColor: '#bfc1b7', bgcolor: '#fdfdf8' }}
```

- [ ] **Step 2: Restyle `CommentDrawer`**

Change drawer paper to:

```ts
[`& .${drawerClasses.paper}`]: {
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  height: '72vh',
  bgcolor: '#eeefe9',
  border: '1px solid #bfc1b7',
  boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
}
```

Keep `anchor="bottom"`, `open`, `onClose`, and `ModalProps`.

- [ ] **Step 3: Restyle `CommentSection` and `CommentList` spacing**

Use these wrappers:

```tsx
<Box onClick={(e) => e.stopPropagation()} sx={{ bgcolor: '#eeefe9' }}>
  <Box sx={{ px: 1, pb: 1 }}>
```

For empty list:

```tsx
<Box
  sx={{
    py: 3,
    px: 1,
    textAlign: 'center',
    color: 'text.secondary',
    border: 1,
    borderColor: '#bfc1b7',
    bgcolor: '#fdfdf8',
    borderRadius: 1,
    mt: 1,
  }}
>
```

- [ ] **Step 4: Restyle `CommentItem`**

Keep local like/reply state. Use a parchment card surface:

```ts
sx={{
  display: 'flex',
  gap: 1,
  py: 1,
  px: 1,
  border: 1,
  borderColor: '#bfc1b7',
  borderRadius: 1,
  bgcolor: '#fdfdf8',
  '&:hover': {
    bgcolor: '#f4f4f4',
    '& .comment-action': {
      color: '#F54E00',
    },
  },
}}
```

For reply nesting:

```ts
sx={{
  mt: 1,
  pl: 1.5,
  ml: 0.5,
  borderLeft: 1,
  borderColor: '#bfc1b7',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
}}
```

Add `className="comment-action"` to like/reply/show-replies controls.

- [ ] **Step 5: Restyle `CommentForm`**

Keep submit behavior and auth gating. Change the form wrapper to:

```ts
sx={{ display: 'flex', gap: 1, py: 1, alignItems: 'flex-start' }}
```

Use `variant="outlined"` for `TextField` and:

```ts
sx={{
  '& .MuiOutlinedInput-root': {
    bgcolor: '#eeefe9',
    borderRadius: 1,
    fontSize: 14,
  },
  '& .MuiInputBase-input': {
    maxHeight: 'calc(4 * 1.2em + 16px)',
    overflow: 'auto',
  },
}}
```

For submit button:

```ts
sx={{
  textTransform: 'none',
  minWidth: 'auto',
  bgcolor: '#1e1f23',
  color: '#ffffff',
  '&:hover': {
    bgcolor: '#1e1f23',
    color: '#F7A501',
    opacity: 0.72,
  },
}}
```

- [ ] **Step 6: Restyle `CommentItemSkeleton`**

Use:

```tsx
<Stack
  direction="row"
  spacing={1}
  sx={{
    p: 1,
    my: 0.75,
    border: 1,
    borderColor: '#bfc1b7',
    borderRadius: 1,
    bgcolor: '#fdfdf8',
  }}
>
```

- [ ] **Step 7: Run the design contract**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit comment work**

```bash
git add src/components/comment/comment-sidebar.tsx src/components/comment/comment-drawer.tsx src/components/comment/comment-section.tsx src/components/comment/comment-list.tsx src/components/comment/comment-item.tsx src/components/comment/comment-form.tsx src/components/comment/comment-item-skeleton.tsx
git commit -m "style: redesign comments for board workbench"
```

## Task 6: Typecheck, Lint, Build, And Visual Verify

**Files:**
- No planned source edits unless verification finds defects.

- [ ] **Step 1: Run the full design contract**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: PASS with `Board workbench redesign contract passed.`

- [ ] **Step 2: Run TypeScript**

Run:

```bash
npm run ts
```

Expected: exit code 0. If it fails, fix only the errors introduced by this redesign.

- [ ] **Step 3: Run ESLint**

Run:

```bash
npm run lint
```

Expected: exit code 0. If existing unrelated lint failures appear, record them separately and do not rewrite unrelated files.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: exit code 0.

- [ ] **Step 5: Start or reuse the dev server**

Run:

```bash
npm run dev
```

Expected: Next.js serves on `http://localhost:8083`. If port 8083 is occupied, identify the existing process and reuse it when it is this app; otherwise start on another available port with `npx next dev -p <port>`.

- [ ] **Step 6: Manual browser verification**

Verify these viewports:

```text
Desktop: 1440x900
Tablet: 900x900
Mobile: 390x844
```

Expected checks:

- `/board` renders warm parchment background with no white/green legacy theme.
- Desktop shows left tools, center feed, and stable right comments area without overlap.
- Mobile shows feed with compact filters and comments in bottom drawer.
- Long Korean titles wrap without overflowing cards or buttons.
- Hovering post/action controls reveals orange text or icon accents.
- Clicking comments opens sidebar/drawer.
- Clicking source opens the original URL in a new tab.
- Image preview opens and closes.
- Empty/error/loading states remain readable.

- [ ] **Step 7: Final status check**

Run:

```bash
git status --short
```

Expected: only intended redesign files are modified or committed. Existing unrelated dirty files that predated the work must remain preserved.

## Self-Review Checklist

- Spec coverage:
  - Warm palette and IBM Plex Sans: Task 2.
  - App shell: Task 3.
  - Three-pane desktop and mobile collapse: Task 4.
  - Filters, post cards, states, image dialog: Task 4.
  - Login entry: Task 3.
  - Comment sidebar/drawer/list/items/form/skeleton: Task 5.
  - Verification and manual viewport checks: Task 6.
- Type consistency:
  - Existing hooks and API functions are reused without signature changes.
  - New render block names match the verification script: `renderToolPane`, `renderFeedHeader`, `renderCommentEmptyState`.
  - New workbench class name matches the verification script: `BoardWorkbench`.
- Scope:
  - No backend, API, auth-flow, search, sorting, or non-board route work is included.
