# Board Responsive Layout, Like Count, and Header Reflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show non-interactive like counts in collapsed board rows, reclaim the hidden header's 58-pixel space, and add a 900–1399px two-column board tier that keeps Top 10 while moving comments into the drawer.

**Architecture:** Keep `AppShell` as the single owner of effective header visibility and publish its current content offset through a scoped CSS variable. Keep `BoardView` as the board layout owner, but replace the pointer-based binary branch with independent width-based Top 10, comment-sidebar, and comment-drawer decisions. Keep each `BoardPostCard`'s existing local like count as the source for both collapsed and expanded displays.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Material UI 9, Vitest, Testing Library, Node assertion-based UI contracts

---

## File Structure

- Modify `scripts/verify-board-ui.mjs`: add source contracts for collapsed likes, the three width tiers, drawer/sidebar transitions, coordinated header state, and shared sticky offsets.
- Create `tests/runtime/board-responsive-comments.test.tsx`: exercise the stateful compact → wide → compact comment presentation transition.
- Create `tests/runtime/app-shell-header-layout.test.tsx`: exercise keyboard-focus override while the scroll state says the header is hidden.
- Modify `src/sections/board/view/board-view.tsx`: render the collapsed like counter, derive width-only layout flags, switch comments between drawer and sidebar, and consume the shell offset for sticky panes.
- Modify `src/layouts/app-shell.tsx`: derive effective header visibility, coordinate focus, transition main padding, and publish the responsive sticky offset.
- Modify `src/components/comment/comment-sidebar.tsx`: replace fixed top/height values with the shell offset variable.

No API, backend, global theme-breakpoint, Top 10 page, or comment-content files change.

### Task 1: Add the collapsed post like count

**Files:**
- Modify: `scripts/verify-board-ui.mjs:528-542`
- Modify: `src/sections/board/view/board-view.tsx:810-835`

- [ ] **Step 1: Add the failing collapsed-like source contract**

Insert these assertions immediately before the existing assertion that forbids `handleLike` in
`collapsedCardSource`:

```js
assert.match(
  collapsedCardSource,
  /className="collapsed-like-count"[\s\S]*FavoriteBorderIcon[\s\S]*label=\{`\$\{currentLikeCount\}`\}[\s\S]*aria-label=\{`좋아요 \$\{currentLikeCount\}개`\}/,
  'collapsed post cards should display the current application like count'
);
assert.doesNotMatch(
  collapsedCardSource,
  /className="collapsed-like-count"[\s\S]*onClick=/,
  'collapsed like counts should be non-interactive'
);
```

- [ ] **Step 2: Run the Board UI verifier and confirm RED**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: FAIL with `collapsed post cards should display the current application like count`.

- [ ] **Step 3: Render the quiet like-count Chip beside the comment count**

In `BoardPostCard`, replace the collapsed count `<Stack>` at
`src/sections/board/view/board-view.tsx:810-835` with:

```tsx
<Stack
  direction="row"
  spacing={0.5}
  useFlexGap
  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
>
  <Chip
    icon={<ChatBubbleOutlineIcon fontSize="small" />}
    label={`${post.commentCount ?? 0}`}
    size="small"
    variant="outlined"
    aria-label={`댓글 ${post.commentCount ?? 0}개`}
    sx={{
      height: 24,
      bgcolor: 'transparent',
      borderColor: 'transparent',
      color: 'text.secondary',
      '& .MuiChip-label': {
        px: 0.5,
      },
      '& .MuiChip-icon': {
        color: 'inherit',
        ml: 0,
      },
    }}
  />
  <Chip
    className="collapsed-like-count"
    icon={<FavoriteBorderIcon fontSize="small" />}
    label={`${currentLikeCount}`}
    size="small"
    variant="outlined"
    aria-label={`좋아요 ${currentLikeCount}개`}
    sx={{
      height: 24,
      bgcolor: 'transparent',
      borderColor: 'transparent',
      color: 'text.secondary',
      '& .MuiChip-label': {
        px: 0.5,
      },
      '& .MuiChip-icon': {
        color: 'inherit',
        ml: 0,
      },
    }}
  />
</Stack>
```

Do not add `onClick`, `component="button"`, or a new like handler. Leave the existing
`expanded-like-action` button unchanged.

- [ ] **Step 4: Run focused checks and confirm GREEN**

Run:

```bash
node scripts/verify-board-ui.mjs
yarn eslint src/sections/board/view/board-view.tsx
yarn ts
```

Expected: the Board UI verifier passes, ESLint reports no errors, and TypeScript exits 0.

- [ ] **Step 5: Commit the list count**

```bash
git add scripts/verify-board-ui.mjs src/sections/board/view/board-view.tsx
git commit -m "feat: show board like counts in post list"
```

### Task 2: Add the compact desktop board tier

**Files:**
- Modify: `scripts/verify-board-ui.mjs:77-90`
- Modify: `scripts/verify-board-ui.mjs:261-289`
- Modify: `scripts/verify-board-ui.mjs:351-355`
- Create: `tests/runtime/board-responsive-comments.test.tsx`
- Modify: `src/sections/board/view/board-view.tsx:78-89`
- Modify: `src/sections/board/view/board-view.tsx:133-142`
- Modify: `src/sections/board/view/board-view.tsx:257-272`
- Modify: `src/sections/board/view/board-view.tsx:491-548`

- [ ] **Step 1: Replace the old pointer-based source contracts with three-tier contracts**

In the `handleCommentOpen` assertion near the top of `scripts/verify-board-ui.mjs`, replace
`isContentFirstLayout` with `useCommentDrawer`:

```js
assert.match(
  boardView.slice(handleCommentOpenStart, handleCommentCloseStart),
  /handlePostSelect\(post\)[\s\S]*useCommentDrawer[\s\S]*setMobileCommentOpen\(true\)/,
  'the explicit comment action should open the drawer in mobile and compact desktop layouts'
);
```

Replace the old `isTabletContentViewport` / `isContentFirstLayout` assertions with:

```js
assert.doesNotMatch(
  boardView,
  /any-pointer:\s*coarse/,
  'board layout tiers should depend on viewport width rather than pointer type'
);
assert.match(
  boardView,
  /const isWideDesktop = useMediaQuery\('\(min-width: 1400px\)'\);[\s\S]*const showTop10Sidebar = !isMobile;[\s\S]*const showCommentSidebar = isWideDesktop;[\s\S]*const useCommentDrawer = !isWideDesktop;/,
  'board view should define mobile, compact desktop, and wide desktop decisions'
);
assert.match(
  boardView,
  /display:\s*isMobile \? 'block' : 'grid'/,
  'only mobile should collapse the workbench to one feed column'
);
assert.match(
  boardView,
  /gridTemplateColumns:\s*showCommentSidebar[\s\S]*`\$\{workbenchSideColumnWidth\}px minmax\(0, 1fr\) \$\{workbenchSideColumnWidth\}px`[\s\S]*`\$\{workbenchSideColumnWidth\}px minmax\(0, 1fr\)`/,
  'compact desktop should keep Top 10 and feed while wide desktop keeps all three columns'
);
assert.match(
  boardView,
  /\{showTop10Sidebar && \([\s\S]*renderToolPane[\s\S]*\)\}/,
  'Top 10 should render on compact and wide desktop only'
);
assert.match(
  boardView,
  /\{showCommentSidebar && \([\s\S]*CommentSidebar[\s\S]*\)\}/,
  'the comment sidebar should render only on wide desktop'
);
assert.match(
  boardView,
  /useEffect\(\(\) => \{\s*if \(showCommentSidebar\) \{\s*setMobileCommentOpen\(false\);\s*\}\s*\}, \[showCommentSidebar\]\);/,
  'entering wide desktop should close drawer state without clearing the selected post'
);
assert.match(
  boardView,
  /\{useCommentDrawer && selectedPost && \([\s\S]*<CommentDrawer[\s\S]*open=\{mobileCommentOpen\}/,
  'mobile and compact desktop should render the controlled comment drawer'
);
```

Remove the former assertion that requires
`open={isContentFirstLayout && mobileCommentOpen}`.

- [ ] **Step 2: Add the failing runtime resize test**

Create `tests/runtime/board-responsive-comments.test.tsx` with this complete content:

```tsx
import type { BoardPost } from 'src/api/board-api';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { BoardView } from 'src/sections/board/view/board-view';

const mocks = vi.hoisted(() => ({
  viewportWidth: 1100,
  useBoard: vi.fn(),
  isRead: vi.fn(() => false),
  markAsRead: vi.fn(),
}));

vi.mock('@mui/material/useMediaQuery', () => ({
  default: (query: string) => {
    if (query.includes('max-width:899')) return mocks.viewportWidth < 900;
    if (query.includes('min-width: 1400')) return mocks.viewportWidth >= 1400;
    return false;
  },
}));

vi.mock('src/hooks/use-board', () => ({
  useBoard: mocks.useBoard,
}));

vi.mock('src/store/auth-store', () => ({
  useAuthStore: () => ({ isAuthenticated: false }),
}));

vi.mock('src/store/read-store', () => ({
  useReadStore: () => ({
    isRead: mocks.isRead,
    markAsRead: mocks.markAsRead,
  }),
}));

vi.mock('src/components/top10', () => ({
  Top10List: () => <div data-testid="top10-sidebar">Top 10</div>,
}));

vi.mock('src/components/comment', () => ({
  CommentDrawer: ({ open, postId }: { open: boolean; postId: string }) =>
    open ? <div data-testid="comment-drawer" data-post-id={postId} /> : null,
  CommentSidebar: ({ postId }: { postId: string }) => (
    <div data-testid="comment-sidebar" data-post-id={postId} />
  ),
}));

const POST: BoardPost = {
  Id: 'board-responsive-id',
  category: 'community',
  no: 101,
  site: 'example-site',
  siteLabel: 'Example Site',
  title: 'Responsive board fixture',
  url: 'https://example.com/posts/101',
  contents: [{ type: 'text', text: 'Fixture body.' }],
  gptAnswer: 'Fixture summary.',
  tags: ['responsive'],
  analysisStatus: 'done',
  analysisRetryCount: 0,
  analysisError: null,
  createTime: '2026-08-04T09:00:00+09:00',
  thumbnail: null,
  commentCount: 3,
  likeCount: 7,
};

function boardElement() {
  return (
    <ThemeProvider theme={createTheme()}>
      <BoardView />
    </ThemeProvider>
  );
}

describe('BoardView responsive comments', () => {
  beforeEach(() => {
    mocks.viewportWidth = 1100;
    mocks.useBoard.mockReturnValue({
      postData: [POST],
      updatePostAnalysis: vi.fn(),
      loadingRef: { current: null },
      boardFilterOptions: { sites: [] },
      boardContentsQueryError: null,
      boardContentsQueryLoading: false,
    });
  });

  test('keeps Top 10 on compact desktop and moves the selected thread across layouts', async () => {
    const user = userEvent.setup();
    const view = render(boardElement());

    expect(screen.getByTestId('top10-sidebar')).toBeTruthy();
    expect(screen.queryByTestId('comment-sidebar')).toBeNull();

    await user.click(screen.getByText(POST.title));
    await user.click(await screen.findByRole('button', { name: '댓글 열기' }));

    expect(screen.getByTestId('comment-drawer').getAttribute('data-post-id')).toBe(POST.Id);

    mocks.viewportWidth = 1400;
    view.rerender(boardElement());

    await waitFor(() => {
      expect(screen.queryByTestId('comment-drawer')).toBeNull();
    });
    expect(screen.getByTestId('comment-sidebar').getAttribute('data-post-id')).toBe(POST.Id);

    mocks.viewportWidth = 1100;
    view.rerender(boardElement());

    expect(screen.queryByTestId('comment-sidebar')).toBeNull();
    expect(screen.queryByTestId('comment-drawer')).toBeNull();

    await user.click(screen.getByRole('button', { name: '댓글 열기' }));
    expect(screen.getByTestId('comment-drawer').getAttribute('data-post-id')).toBe(POST.Id);
  });
});
```

- [ ] **Step 3: Run focused tests and confirm RED**

Run:

```bash
node scripts/verify-board-ui.mjs
yarn test tests/runtime/board-responsive-comments.test.tsx
```

Expected: the source verifier fails on the missing width-only layout decisions, and the runtime
test fails because compact desktop does not open a comment drawer.

- [ ] **Step 4: Derive independent width-only layout decisions**

Replace the current `isTabletContentViewport` / `isContentFirstLayout` declarations with:

```tsx
const isMobile = useMediaQuery(pageTheme.breakpoints.down('md'));
const isWideDesktop = useMediaQuery('(min-width: 1400px)');
const showTop10Sidebar = !isMobile;
const showCommentSidebar = isWideDesktop;
const useCommentDrawer = !isWideDesktop;
```

Immediately after the effect that clears `selectedPost` when filtering removes the post, add:

```tsx
useEffect(() => {
  if (showCommentSidebar) {
    setMobileCommentOpen(false);
  }
}, [showCommentSidebar]);
```

- [ ] **Step 5: Update comment open and close behavior**

Replace `handleCommentOpen` and `handleCommentClose` with:

```tsx
const handleCommentOpen = useCallback(
  (post: BoardPost) => {
    handlePostSelect(post);
    if (useCommentDrawer) {
      setMobileCommentOpen(true);
    }
  },
  [handlePostSelect, useCommentDrawer]
);

const handleCommentClose = () => {
  setSelectedPost(null);
  setMobileCommentOpen(false);
};
```

- [ ] **Step 6: Render one, two, or three columns from the new decisions**

Replace the `BoardWorkbench` box and its three child columns with:

```tsx
<Box
  className="BoardWorkbench"
  sx={{
    display: isMobile ? 'block' : 'grid',
    gridTemplateColumns: showCommentSidebar
      ? `${workbenchSideColumnWidth}px minmax(0, 1fr) ${workbenchSideColumnWidth}px`
      : `${workbenchSideColumnWidth}px minmax(0, 1fr)`,
    gap: 1.5,
    alignItems: 'start',
    width: 'min(100%, 1536px)',
    boxSizing: 'border-box',
    mx: 'auto',
  }}
>
  {showTop10Sidebar && (
    <Box
      sx={{
        position: 'sticky',
        top: 78,
        maxHeight: 'calc(100vh - 94px)',
        overflowY: 'auto',
        pr: 0.25,
        scrollbarWidth: 'thin',
      }}
    >
      {renderToolPane}
    </Box>
  )}

  <Stack spacing={1.25} sx={{ minWidth: 0 }}>
    {renderFeedHeader}
    {renderPostList}
  </Stack>

  {showCommentSidebar && (
    <Box sx={{ position: 'sticky', top: 78 }}>
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
  )}
</Box>
```

Replace the existing drawer block with:

```tsx
{useCommentDrawer && selectedPost && (
  <CommentDrawer
    open={mobileCommentOpen}
    onClose={handleCommentClose}
    postId={selectedPost.boardId}
    site={selectedPost.site}
    title="댓글"
  />
)}
```

The hard-coded sticky offsets remain temporarily in this task; Task 3 replaces them with the
shared shell variable.

- [ ] **Step 7: Run focused checks and confirm GREEN**

Run:

```bash
node scripts/verify-board-ui.mjs
yarn test tests/runtime/board-responsive-comments.test.tsx
yarn eslint src/sections/board/view/board-view.tsx tests/runtime/board-responsive-comments.test.tsx
yarn ts
```

Expected: both focused tests pass, ESLint reports no errors, and TypeScript exits 0.

- [ ] **Step 8: Commit the three-tier layout**

```bash
git add scripts/verify-board-ui.mjs tests/runtime/board-responsive-comments.test.tsx src/sections/board/view/board-view.tsx
git commit -m "feat: add compact desktop board layout"
```

### Task 3: Reflow content and sticky panes with the header

**Files:**
- Modify: `scripts/verify-board-ui.mjs:207-235`
- Create: `tests/runtime/app-shell-header-layout.test.tsx`
- Modify: `src/layouts/app-shell.tsx:250-293`
- Modify: `src/layouts/app-shell.tsx:372-386`
- Modify: `src/sections/board/view/board-view.tsx:503-535`
- Modify: `src/components/comment/comment-sidebar.tsx:36-49`

- [ ] **Step 1: Add failing coordinated-header source contracts**

Replace the current AppBar transform and `:focus-within` assertions in
`scripts/verify-board-ui.mjs` with:

```js
assert.match(
  appShell,
  /const \[headerFocused, setHeaderFocused\] = useState\(false\);[\s\S]*const effectiveHeaderHidden = headerHidden && !headerFocused;/,
  'app shell should derive one effective header state from scrolling and keyboard focus'
);
assert.match(
  appShell,
  /data-header-state=\{effectiveHeaderHidden \? 'hidden' : 'visible'\}[\s\S]*onFocusCapture=\{\(\) => setHeaderFocused\(true\)\}[\s\S]*transform:\s*effectiveHeaderHidden \? 'translateY\(-100%\)' : 'translateY\(0\)'/,
  'the AppBar should expose and render the effective header state'
);
assert.match(
  appShell,
  /const handleHeaderBlur = \(event: React\.FocusEvent<HTMLElement>\)[\s\S]*currentTarget\.contains\(nextTarget as Node\)[\s\S]*setHeaderFocused\(false\)/,
  'focus moving within the header should not hide it between controls'
);
assert.match(
  appShell,
  /component="main"[\s\S]*data-header-state=\{effectiveHeaderHidden \? 'hidden' : 'visible'\}[\s\S]*'--app-content-top-offset': effectiveHeaderHidden \? '16px' : '74px'[\s\S]*theme\.breakpoints\.up\('md'\)[\s\S]*effectiveHeaderHidden \? '20px' : '78px'[\s\S]*pt: 'var\(--app-content-top-offset\)'/,
  'main content should reclaim exactly 58 pixels and publish the sticky offset'
);
assert.match(
  appShell,
  /theme\.transitions\.create\('padding-top',[\s\S]*theme\.transitions\.duration\.shorter/,
  'main content should use the same short transition as the AppBar'
);
assert.equal(
  (appShell.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? []).length,
  2,
  'AppBar and main content should both disable animation for reduced motion'
);
assert.equal(
  (boardView.match(/top: 'var\(--app-content-top-offset, 78px\)'/g) ?? []).length,
  2,
  'Top 10 and comment containers should share the shell sticky offset'
);
assert.match(
  boardView,
  /maxHeight: 'calc\(100vh - var\(--app-content-top-offset, 78px\) - 16px\)'/,
  'Top 10 should reclaim viewport height when the header hides'
);
assert.match(
  commentSidebar,
  /top: 'var\(--app-content-top-offset, 78px\)'[\s\S]*height: 'calc\(100vh - var\(--app-content-top-offset, 78px\) - 16px\)'/,
  'comment sidebar should share the header-aware top and height calculations'
);
```

Keep the existing assertions for route scoping, passive scroll listening, cleanup, AppBar
transform transition, and reduced-motion `transition: 'none'`.

- [ ] **Step 2: Add the failing header-focus runtime test**

Create `tests/runtime/app-shell-header-layout.test.tsx` with this complete content:

```tsx
import { fireEvent, render } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, test, vi } from 'vitest';

import { AppShell } from 'src/layouts/app-shell';

const mocks = vi.hoisted(() => ({
  headerHidden: true,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/board',
}));

vi.mock('src/hooks/use-hide-header-on-scroll', () => ({
  useHideHeaderOnScroll: () => mocks.headerHidden,
}));

vi.mock('src/store/auth-store', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    user: null,
    authStatus: 'unauthenticated',
  }),
}));

vi.mock('src/auth/permissions', () => ({
  isAdmin: () => false,
}));

vi.mock('src/theme/color-mode-toggle', () => ({
  ColorModeToggle: () => <button type="button">Theme</button>,
}));

vi.mock('src/auth/components/form-oauth', () => ({
  default: () => <button type="button">Login</button>,
}));

describe('AppShell header layout state', () => {
  test('reveals the header and content spacing together while focus is inside', () => {
    const view = render(
      <ThemeProvider theme={createTheme()}>
        <AppShell>
          <div>Board content</div>
        </AppShell>
      </ThemeProvider>
    );

    const header = view.container.querySelector('.app-header') as HTMLElement;
    const main = view.container.querySelector('main') as HTMLElement;
    const homeLink = header.querySelector('a') as HTMLAnchorElement;

    expect(header.getAttribute('data-header-state')).toBe('hidden');
    expect(main.getAttribute('data-header-state')).toBe('hidden');

    fireEvent.focus(homeLink);

    expect(header.getAttribute('data-header-state')).toBe('visible');
    expect(main.getAttribute('data-header-state')).toBe('visible');

    fireEvent.blur(homeLink, { relatedTarget: document.body });

    expect(header.getAttribute('data-header-state')).toBe('hidden');
    expect(main.getAttribute('data-header-state')).toBe('hidden');
  });
});
```

- [ ] **Step 3: Run focused tests and confirm RED**

Run:

```bash
node scripts/verify-board-ui.mjs
yarn test tests/runtime/app-shell-header-layout.test.tsx
```

Expected: the source verifier fails on missing `effectiveHeaderHidden`, and the runtime test
reports `null` for the initial `data-header-state`.

- [ ] **Step 4: Coordinate scroll and keyboard-focus header state**

In `AppShell`, add state beside `mobileOpen`, derive the effective state after the scroll hook,
and add the blur handler:

```tsx
const [mobileOpen, setMobileOpen] = useState(false);
const [headerFocused, setHeaderFocused] = useState(false);
const { isAuthenticated, user, authStatus } = useAuthStore();
const isAdminUser = isAdmin(user);
const isBoardRoute = pathname === '/board' || pathname.startsWith('/board/');
const headerHidden = useHideHeaderOnScroll(isBoardRoute, 64, pathname);
const effectiveHeaderHidden = headerHidden && !headerFocused;

const handleHeaderBlur = (event: React.FocusEvent<HTMLElement>) => {
  const nextTarget = event.relatedTarget;
  if (!nextTarget || !event.currentTarget.contains(nextTarget as Node)) {
    setHeaderFocused(false);
  }
};
```

Update the AppBar opening and its transform block to:

```tsx
<AppBar
  className="app-header"
  data-header-state={effectiveHeaderHidden ? 'hidden' : 'visible'}
  position="fixed"
  elevation={0}
  onFocusCapture={() => setHeaderFocused(true)}
  onBlurCapture={handleHeaderBlur}
  sx={{
    zIndex: (theme) => theme.zIndex.drawer + 1,
    color: 'text.primary',
    bgcolor: 'background.default',
    borderBottom: 1,
    borderColor: 'divider',
    boxShadow: 'none',
    transform: effectiveHeaderHidden ? 'translateY(-100%)' : 'translateY(0)',
    transition: (theme) =>
      theme.transitions.create('transform', {
        duration: theme.transitions.duration.shorter,
      }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  }}
>
```

Remove the old CSS-only `&:focus-within` transform override.

- [ ] **Step 5: Publish and animate the responsive content offset**

Replace the main `<Box>` opening and `sx` block with:

```tsx
<Box
  component="main"
  data-header-state={effectiveHeaderHidden ? 'hidden' : 'visible'}
  sx={(theme) => ({
    '--app-content-top-offset': effectiveHeaderHidden ? '16px' : '74px',
    [theme.breakpoints.up('md')]: {
      '--app-content-top-offset': effectiveHeaderHidden ? '20px' : '78px',
    },
    width: '100%',
    boxSizing: 'border-box',
    px: { xs: 1.5, sm: 2, md: 3 },
    py: { xs: 1.5, md: 2 },
    pt: 'var(--app-content-top-offset)',
    transition: theme.transitions.create('padding-top', {
      duration: theme.transitions.duration.shorter,
    }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  })}
>
```

- [ ] **Step 6: Make Top 10 and comments consume the shared offset**

In the Top 10 sticky box from Task 2, replace `top` and `maxHeight` with:

```tsx
top: 'var(--app-content-top-offset, 78px)',
maxHeight: 'calc(100vh - var(--app-content-top-offset, 78px) - 16px)',
```

In the wide comment-container box, replace `top: 78` with:

```tsx
top: 'var(--app-content-top-offset, 78px)',
```

In `src/components/comment/comment-sidebar.tsx`, replace its fixed `top` and `height` with:

```tsx
top: 'var(--app-content-top-offset, 78px)',
height: 'calc(100vh - var(--app-content-top-offset, 78px) - 16px)',
```

- [ ] **Step 7: Run focused checks and confirm GREEN**

Run:

```bash
node scripts/verify-board-ui.mjs
yarn test tests/runtime/app-shell-header-layout.test.tsx tests/runtime/use-hide-header-on-scroll.test.tsx tests/runtime/board-responsive-comments.test.tsx
yarn eslint src/layouts/app-shell.tsx src/sections/board/view/board-view.tsx src/components/comment/comment-sidebar.tsx tests/runtime/app-shell-header-layout.test.tsx tests/runtime/board-responsive-comments.test.tsx
yarn ts
```

Expected: source and runtime tests pass, ESLint reports no errors, and TypeScript exits 0.

- [ ] **Step 8: Commit coordinated header reflow**

```bash
git add scripts/verify-board-ui.mjs tests/runtime/app-shell-header-layout.test.tsx src/layouts/app-shell.tsx src/sections/board/view/board-view.tsx src/components/comment/comment-sidebar.tsx
git commit -m "fix: reflow board content with hidden header"
```

### Task 4: Full regression and browser verification

**Files:**
- Verify: `scripts/verify-board-ui.mjs`
- Verify: `tests/runtime/board-responsive-comments.test.tsx`
- Verify: `tests/runtime/app-shell-header-layout.test.tsx`
- Verify: `src/layouts/app-shell.tsx`
- Verify: `src/sections/board/view/board-view.tsx`
- Verify: `src/components/comment/comment-sidebar.tsx`

- [ ] **Step 1: Run the complete frontend quality gate**

Run:

```bash
yarn check
```

Expected: Vitest, TypeScript, ESLint, and every `scripts/verify-*.mjs` contract exit 0.

- [ ] **Step 2: Build the production frontend**

Run:

```bash
yarn build
```

Expected: Next.js completes the production build without compilation, type, or route errors.

- [ ] **Step 3: Start the frontend for browser verification**

Run:

```bash
yarn dev
```

Expected: the app reports ready at `http://localhost:8083`.

- [ ] **Step 4: Verify the responsive boundary matrix**

Open `http://localhost:8083/board/` in the in-app browser and verify:

| Width | Top 10 sidebar | Feed | Comment presentation |
|---:|---|---|---|
| 390 | Hidden | Full-width | Bottom drawer |
| 899 | Hidden | Full-width | Bottom drawer |
| 900 | 320px left column | Flexible center | Bottom drawer |
| 1100 | 320px left column | Flexible center | Bottom drawer |
| 1366 | 320px left column | Flexible center | Bottom drawer |
| 1399 | 320px left column | Flexible center | Bottom drawer |
| 1400 | 320px left column | Flexible center | 320px right sidebar |
| 1440 | 320px left column | Flexible center | 320px right sidebar |
| 1536 | 320px left column | Flexible center | 320px right sidebar |

At 1100px, open comments, resize to 1400px, and confirm the same post ID moves to the sidebar.
Resize back to 1100px and confirm the drawer stays closed until the explicit comment action is
pressed again.

- [ ] **Step 5: Verify like display and interaction boundaries**

At 390px and 1440px:

1. Confirm every collapsed post shows comment and heart counts, including visible zeroes.
2. Confirm the collapsed heart count has no pointer action and does not submit a request.
3. Expand a post and confirm the like button appears only in the expanded action row.
4. While authenticated, press the expanded like action and confirm both visible count locations
   update from the response.
5. Force a failed like request and confirm the previous count remains while the warning toast
   appears.

- [ ] **Step 6: Verify header reflow, focus, and motion preferences**

At 1100px and 1440px:

1. At scroll position 0, confirm `data-header-state="visible"` on both AppBar and main.
2. Scroll below 64px and downward; confirm both become `hidden` and the feed plus sticky panes
   move upward exactly 58px.
3. Confirm the Top 10 and comment panes use the reclaimed viewport height without a top gap.
4. Scroll upward and confirm header, main padding, and sticky panes return together.
5. Tab focus into the hidden header and confirm both state attributes become `visible` without
   overlap; move focus out and confirm scroll-hidden state returns.
6. Emulate `prefers-reduced-motion: reduce` and confirm both transitions are disabled.
7. Navigate to `/top10/` and confirm its header and shell spacing remain unchanged while
   scrolling.

- [ ] **Step 7: Inspect the final diff and repository state**

Run:

```bash
git diff --check
git status --short
git log -5 --oneline
```

Expected: no whitespace errors, no unintended files, and the three focused implementation
commits appear after the design/plan documentation commits.

- [ ] **Step 8: Commit only browser-discovered corrections, if any**

If browser verification required a correction, rerun `yarn check` and `yarn build`, then commit
only the corrected frontend/test files:

```bash
git add src scripts tests
git commit -m "fix: refine responsive board interactions"
```

If no correction was needed, do not create an empty commit.
