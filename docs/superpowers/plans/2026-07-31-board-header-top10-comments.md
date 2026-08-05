# Board Scroll Header and Top 10 Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the global header while scrolling down the main board, restore it on upward scrolling, and let dedicated Top 10 rows open the existing comment thread for the same board post.

**Architecture:** Add one route-gated scroll-direction hook and let `AppShell` translate its fixed AppBar without reflow. Extend only the page variant of `Top10List` with a comment target keyed by the real `BoardPost.Id`, then reuse `CommentDrawer` so the existing `['comments', boardId]` cache and backend thread are shared with the main board.

**Tech Stack:** Next.js 16, React 19, TypeScript, Material UI, TanStack Query, Node assertion-based UI contracts

---

## File Structure

- Create `src/hooks/use-hide-header-on-scroll.ts` to isolate scroll direction, threshold, and listener cleanup.
- Modify `src/layouts/app-shell.tsx` to enable the hook only on `/board` and animate the AppBar.
- Modify `src/components/top10/top10-list.tsx` to add the expanded-row comment action and shared drawer target.
- Modify `scripts/verify-board-ui.mjs` to contract-test route scoping, scroll direction, cleanup, and AppBar translation.
- Modify `scripts/verify-top10-ui.mjs` to contract-test real board ID usage, missing-ID disabling, and `CommentDrawer` reuse.

Implementation should begin in a dedicated frontend worktree based on commit `a4142a4`. Do not include the pre-existing `next-env.d.ts` modification from the main working tree.

### Task 1: Direction-aware board header

**Files:**
- Create: `src/hooks/use-hide-header-on-scroll.ts`
- Modify: `src/layouts/app-shell.tsx:1-12`
- Modify: `src/layouts/app-shell.tsx:250-290`
- Test: `scripts/verify-board-ui.mjs`

- [ ] **Step 1: Add failing Board UI contract assertions**

Add the hook source beside the existing `appShell` fixture. The empty-string fallback ensures
the first run fails on the intended contract assertion before the hook file exists:

```js
const hideHeaderHook = fs.existsSync('src/hooks/use-hide-header-on-scroll.ts')
  ? read('src/hooks/use-hide-header-on-scroll.ts')
  : '';
```

Add these assertions after the existing AppShell assertions:

```js
assert.match(
  hideHeaderHook,
  /export function useHideHeaderOnScroll\([\s\S]*enabled:\s*boolean[\s\S]*threshold\s*=\s*64/,
  'header visibility should use a focused route-gated scroll hook'
);
assert.match(
  hideHeaderHook,
  /window\.addEventListener\('scroll',\s*handleScroll,\s*\{\s*passive:\s*true\s*\}\)/,
  'header scroll tracking should use a passive listener'
);
assert.match(
  hideHeaderHook,
  /currentScrollY <= threshold[\s\S]*setHidden\(false\)[\s\S]*delta > 0[\s\S]*setHidden\(true\)[\s\S]*delta < 0[\s\S]*setHidden\(false\)/,
  'header should remain visible near the top, hide downward, and return upward'
);
assert.match(
  hideHeaderHook,
  /return \(\) => window\.removeEventListener\('scroll', handleScroll\)/,
  'header scroll tracking should remove its listener on route change or unmount'
);
assert.match(
  appShell,
  /const isBoardRoute = pathname === '\/board' \|\| pathname\.startsWith\('\/board\/'\)[\s\S]*useHideHeaderOnScroll\(isBoardRoute\)/,
  'AppShell should enable auto-hide only for the board route'
);
assert.match(
  appShell,
  /className="app-header"[\s\S]*transform:\s*headerHidden\s*\?\s*'translateY\(-100%\)'\s*:\s*'translateY\(0\)'[\s\S]*prefers-reduced-motion:\s*reduce/,
  'the fixed AppBar should translate without reflow and respect reduced motion'
);
```

- [ ] **Step 2: Run the Board UI contract and confirm RED**

Run:

```bash
node scripts/verify-board-ui.mjs
```

Expected: failure with `header visibility should use a focused route-gated scroll hook`.

- [ ] **Step 3: Implement the scroll-direction hook**

Create `src/hooks/use-hide-header-on-scroll.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

export function useHideHeaderOnScroll(enabled: boolean, threshold = 64) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);

    if (!enabled) {
      return undefined;
    }

    let previousScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - previousScrollY;

      if (currentScrollY <= threshold) {
        setHidden(false);
      } else if (delta > 0) {
        setHidden(true);
      } else if (delta < 0) {
        setHidden(false);
      }

      previousScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, threshold]);

  return enabled && hidden;
}
```

- [ ] **Step 4: Connect the hook to AppShell**

Add the hook import in `src/layouts/app-shell.tsx`:

```ts
import { useHideHeaderOnScroll } from 'src/hooks/use-hide-header-on-scroll';
```

Inside `AppShell`, immediately after `usePathname` is already available through a new local call, add:

```ts
const pathname = usePathname();
const isBoardRoute = pathname === '/board' || pathname.startsWith('/board/');
const headerHidden = useHideHeaderOnScroll(isBoardRoute);
```

Update the `AppBar` opening and `sx` block:

```tsx
<AppBar
  className="app-header"
  position="fixed"
  elevation={0}
  sx={{
    zIndex: (theme) => theme.zIndex.drawer + 1,
    color: 'text.primary',
    bgcolor: 'background.default',
    borderBottom: 1,
    borderColor: 'divider',
    boxShadow: 'none',
    transform: headerHidden ? 'translateY(-100%)' : 'translateY(0)',
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

Do not change the main content padding or any non-board route.

- [ ] **Step 5: Run focused checks and confirm GREEN**

Run:

```bash
node scripts/verify-board-ui.mjs
yarn ts
yarn eslint src/hooks/use-hide-header-on-scroll.ts src/layouts/app-shell.tsx
```

Expected: Board UI contract passes, TypeScript exits 0, and ESLint reports no errors.

- [ ] **Step 6: Commit the header behavior**

```bash
git add scripts/verify-board-ui.mjs src/hooks/use-hide-header-on-scroll.ts src/layouts/app-shell.tsx
git commit -m "feat: hide board header by scroll direction"
```

### Task 2: Shared Top 10 comment drawer

**Files:**
- Modify: `src/components/top10/top10-list.tsx:1-35`
- Modify: `src/components/top10/top10-list.tsx:180-430`
- Modify: `src/components/top10/top10-list.tsx:430-560`
- Test: `scripts/verify-top10-ui.mjs`

- [ ] **Step 1: Add failing Top 10 UI contract assertions**

After `pageRowSource` is created in `scripts/verify-top10-ui.mjs`, add:

```js
assert.match(
  top10List,
  /import \{ CommentDrawer \} from 'src\/components\/comment'/,
  'Top 10 should reuse the existing comment drawer'
);
assert.match(
  pageRowSource,
  /ChatBubbleOutlineRoundedIcon[\s\S]*onClick=\{\(\) => onOpenComments\(post\)\}[\s\S]*disabled=\{!post\.Id\}[\s\S]*댓글/,
  'expanded page rows should expose comments and disable them without a database board ID'
);
assert.doesNotMatch(
  sidebarRowSource,
  /onOpenComments|CommentDrawer|ChatBubbleOutlineRoundedIcon/,
  'compact sidebar rows should remain navigation-only'
);
assert.match(
  top10List,
  /type Top10CommentTarget = \{[\s\S]*postId:\s*string[\s\S]*site:\s*string[\s\S]*\} \| null/,
  'Top 10 should keep a stable database-backed comment target'
);
assert.match(
  top10List,
  /const postId = selectedPost\.Id[\s\S]*if \(!postId\) return[\s\S]*setCommentTarget\(\{ postId, site: selectedPost\.site \}\)/,
  'Top 10 must never substitute a site-number fallback for comments'
);
assert.match(
  top10List,
  /<CommentDrawer[\s\S]*open=\{Boolean\(commentTarget\)\}[\s\S]*postId=\{commentTarget\?\.postId \?\? ''\}[\s\S]*site=\{commentTarget\?\.site \?\? ''\}/,
  'Top 10 should open the shared thread using the selected BoardPost.Id and site'
);
```

- [ ] **Step 2: Run the Top 10 UI contract and confirm RED**

Run:

```bash
node scripts/verify-top10-ui.mjs
```

Expected: failure with `Top 10 should reuse the existing comment drawer`.

- [ ] **Step 3: Add the comment action contract to the page row**

Add imports in `src/components/top10/top10-list.tsx`:

```ts
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';

import { CommentDrawer } from 'src/components/comment';
```

Add the target type near `Top10ListProps`:

```ts
type Top10CommentTarget = {
  postId: string;
  site: string;
} | null;
```

Extend `Top10PageRowProps`:

```ts
onOpenComments: (post: BoardPost) => void;
```

Destructure `onOpenComments` in `Top10PageRow`, then replace the current single-action stack
with:

```tsx
<Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={1}
  sx={{ mt: 1.25, justifyContent: 'flex-end' }}
>
  <Button
    type="button"
    size="small"
    variant="outlined"
    color="inherit"
    startIcon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
    onClick={() => onOpenComments(post)}
    disabled={!post.Id}
    aria-label={`${post.title} 댓글 열기`}
    sx={{
      width: { xs: '100%', sm: 'auto' },
      bgcolor: 'background.paper',
      borderColor: 'divider',
      color: 'text.primary',
      '&:hover': {
        bgcolor: 'background.subtle',
        borderColor: 'divider',
        color: 'secondary.main',
      },
    }}
  >
    댓글{post.commentCount ? ` ${post.commentCount}` : ''}
  </Button>

  <Button
    component="a"
    href={post.url}
    target="_blank"
    rel="noopener noreferrer"
    size="small"
    variant="outlined"
    color="inherit"
    startIcon={<LaunchRoundedIcon fontSize="small" />}
    aria-label={`${post.title} 원문 사이트에서 열기`}
    sx={{
      width: { xs: '100%', sm: 'auto' },
      bgcolor: 'background.paper',
      borderColor: 'divider',
      color: 'text.primary',
      '&:hover': {
        bgcolor: 'background.subtle',
        borderColor: 'divider',
        color: 'secondary.main',
      },
    }}
  >
    원문 바로가기
  </Button>
</Stack>
```

- [ ] **Step 4: Store the real board ID and render CommentDrawer**

At the beginning of `Top10List`, add:

```ts
const [commentTarget, setCommentTarget] = useState<Top10CommentTarget>(null);
```

Pass this handler to every `Top10PageRow`:

```tsx
onOpenComments={(selectedPost) => {
  const postId = selectedPost.Id;
  if (!postId) return;

  setCommentTarget({ postId, site: selectedPost.site });
}}
```

Wrap the existing returned `Card` in a fragment and render this sibling after the card:

```tsx
{variant === 'page' && (
  <CommentDrawer
    open={Boolean(commentTarget)}
    onClose={() => setCommentTarget(null)}
    postId={commentTarget?.postId ?? ''}
    site={commentTarget?.site ?? ''}
    title="댓글"
  />
)}
```

Keep `commentTarget` independent of `expandedItem` and `selectedDate` so the open drawer does
not silently switch threads during a date or row change.

- [ ] **Step 5: Run focused checks and confirm GREEN**

Run:

```bash
node scripts/verify-top10-ui.mjs
yarn ts
yarn eslint src/components/top10/top10-list.tsx
```

Expected: Top 10 UI contract passes, TypeScript exits 0, and ESLint reports no errors.

- [ ] **Step 6: Commit the Top 10 comment integration**

```bash
git add scripts/verify-top10-ui.mjs src/components/top10/top10-list.tsx
git commit -m "feat: connect top10 posts to shared comments"
```

### Task 3: Full regression and browser verification

**Files:**
- Verify: `src/hooks/use-hide-header-on-scroll.ts`
- Verify: `src/layouts/app-shell.tsx`
- Verify: `src/components/top10/top10-list.tsx`
- Verify: `scripts/verify-board-ui.mjs`
- Verify: `scripts/verify-top10-ui.mjs`

- [ ] **Step 1: Run the full frontend quality gate**

Run:

```bash
yarn check
```

Expected: TypeScript, ESLint, theme, auth profile, Top 10, board, and admin Shorts checks all
exit 0.

- [ ] **Step 2: Build the production frontend**

Run:

```bash
yarn build
```

Expected: Next.js production build completes successfully with no type or compilation errors.

- [ ] **Step 3: Start the frontend for browser verification**

Run:

```bash
yarn dev
```

Expected: Next.js reports the application ready on `http://localhost:8083`.

- [ ] **Step 4: Verify the board header in a desktop viewport**

Using the in-app browser at `http://localhost:8083/board/`:

1. Confirm the header is visible at scroll position 0.
2. Scroll down more than 64 pixels and confirm `.app-header` has
   `transform: translateY(-100%)`.
3. Scroll upward and confirm `.app-header` returns to `transform: translateY(0)`.
4. Navigate to `/top10/`, scroll down, and confirm its header remains visible.

Expected: only the main board header follows scroll direction.

- [ ] **Step 5: Verify the shared Top 10 comment thread**

Using the in-app browser at `http://localhost:8083/top10/`:

1. Expand a Top 10 row that has a database ID.
2. Confirm the comment action appears beside the source action.
3. Open comments and submit a uniquely identifiable comment while authenticated.
4. Close the drawer, navigate to `/board/`, locate the same post, and open its comments.
5. Confirm the uniquely identifiable comment appears in the main-board thread.
6. Repeat the layout check at a mobile viewport and confirm the bottom drawer is usable.

Expected: Top 10 and main board read and mutate one comment thread for the same `BoardPost.Id`.

- [ ] **Step 6: Inspect the final diff and commit only if browser verification required a correction**

Run:

```bash
git status --short
git diff --check
git log -3 --oneline
```

Expected: no unintended files, no whitespace errors, and the two feature commits are at the
branch tip. If browser verification required a focused correction, rerun `yarn check` and
`yarn build`, then commit only that correction with:

```bash
git add src scripts
git commit -m "fix: refine board and top10 interactions"
```
