# Board Scroll Header and Top 10 Comments Design

## Goal

Improve long-form browsing by hiding the global header while the user scrolls down the main
board, restoring it as soon as the user scrolls up, and allow comments to be read and written
from expanded Top 10 posts while sharing the same comment threads as the main board.

## Scope

This change covers two frontend behaviors:

1. Direction-aware header visibility on the `/board` route.
2. A comment action and shared comment drawer for expanded rows on the dedicated `/top10/`
   page.

The compact Top 10 sidebar embedded in the main board remains a navigation list and does not
gain an inline comment action. Backend comment storage and API contracts do not change.

## Header Behavior

`AppShell` continues to own the fixed application header. A focused scroll-direction hook
tracks the previous window scroll position when the current route is `/board`:

- The header is visible at the top of the page.
- Scrolling down beyond a small threshold hides the header.
- Any meaningful upward movement shows the header immediately.
- Navigating away from `/board` resets the header to visible and disables direction tracking.
- The header uses a transform transition so hiding it does not trigger page reflow.
- Reduced-motion preferences remove or minimize the transition.

The existing main-content top padding remains in place because the fixed header still overlays
the page when visible. No sticky behavior changes are applied to Top 10, account, or admin
routes.

## Top 10 Comment Interaction

Only the expanded `Top10PageRow` receives a comment action. The action appears beside the
existing source-link action and displays the post's known comment count when available.

Selecting the action stores the selected post as the active comment target and opens the
existing `CommentDrawer`. The drawer receives:

- `postId`: the original `BoardPost.Id`
- `site`: the original `BoardPost.site`
- `open`: whether that post is the active comment target

Closing the drawer clears the active target without collapsing the Top 10 row. Rows without a
real `BoardPost.Id` expose a disabled comment action because a fallback key such as
`site-no` must never create a second comment thread.

## Shared Data Flow

The existing comment hook caches and mutates comments under `['comments', boardId]`. Both the
main board and Top 10 pass the same database-backed board ID, so they read and update one
thread:

1. Top 10 loads a `BoardPost`.
2. The user opens comments for that post.
3. `CommentDrawer` calls `useComments({ boardId: post.Id })`.
4. Reads, new comments, replies, and likes use the existing comment API.
5. Opening the same post from the main board uses the identical query key and backend record.

No comment duplication, synchronization endpoint, or cross-page mapping table is introduced.

## Error and Edge-Case Handling

- Missing post ID: disable the comment action and do not open the drawer.
- Comment API failure: retain the existing drawer and hook error behavior.
- Authentication requirement: retain the existing comment form/login behavior.
- Historical Top 10 entries: allow comments when the historical result still contains the
  current board ID; otherwise disable the action.
- Date or row changes while a drawer is open: keep the selected board ID stable until the user
  closes the drawer.
- Route changes and component unmounts: remove the scroll listener and restore header
  visibility.

## Component Boundaries

- `src/hooks/use-hide-header-on-scroll.ts`: owns direction detection and listener cleanup.
- `src/layouts/app-shell.tsx`: enables the behavior only for `/board` and animates the AppBar.
- `src/components/top10/top10-list.tsx`: owns the active Top 10 comment target, renders the
  comment action, and opens the existing drawer.
- Existing comment components and APIs remain unchanged.

## Verification

The implementation follows test-first development:

1. Extend the Board UI contract to require route-scoped, direction-aware header behavior and
   cleanup.
2. Extend the Top 10 UI contract to require a comment action only in page rows, use
   `BoardPost.Id`, and render the existing `CommentDrawer`.
3. Run each contract before implementation and confirm the new assertions fail for the
   intended missing behavior.
4. Implement the smallest changes that satisfy the contracts.
5. Run the focused contracts, TypeScript checks, lint, the repository check command, and a
   production build.
6. Verify in a browser that desktop and mobile board scrolling hides and restores the header,
   and that a comment created from Top 10 appears in the main board thread for the same post.

## Acceptance Criteria

- On `/board`, downward scrolling hides the fixed header after the threshold.
- On `/board`, upward scrolling restores the header immediately.
- At the top of `/board`, the header is visible.
- Other application routes keep the header visible.
- An expanded Top 10 page row includes an accessible comment action.
- The action opens the existing comment drawer for that row's database board ID.
- Comments, replies, and likes are shared with the main board thread.
- Missing board IDs cannot create fallback or duplicate comment threads.
- Existing Top 10 expansion, summary generation, source links, and main-board comments continue
  to work.
