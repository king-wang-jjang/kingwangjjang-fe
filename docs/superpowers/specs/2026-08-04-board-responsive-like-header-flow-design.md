# Board Responsive Layout, Like Count, and Header Reflow Design

## Goal

Improve the main board in three related ways:

1. Show each post's application like count in the collapsed list while keeping the like action
   available only in the expanded post.
2. Reclaim the fixed header's full 58-pixel height when the header hides, including the space
   used by the sticky Top 10 and comment panes.
3. Replace the current mobile/desktop split with mobile, compact desktop, and wide desktop
   layouts so comments stop crowding the post feed at narrower desktop widths.

The change is frontend-only. Existing board, like, Top 10, and comment API contracts remain
unchanged.

## Current Problems

- Collapsed post cards show only the comment count even though `BoardPost.likeCount` is already
  available. The interactive like button correctly lives in the expanded panel.
- The board header hides with a paint-only transform. The main element keeps 74 pixels of mobile
  top padding or 78 pixels of desktop top padding, and the sticky panes keep a 78-pixel top
  offset, leaving a header-sized gap.
- Fine-pointer desktop devices enter the three-column layout at 900 pixels. Two fixed 320-pixel
  side columns, shell padding, and gaps can leave the center feed only a few hundred pixels wide.
- A coarse-pointer exception between 900 and 1400 pixels hides both side panes. It does not help
  narrow laptop or desktop windows and also removes Top 10 when only comments need to move.

## Chosen Approach

Extend the existing component structure instead of introducing a layout provider or replacing
the board with a CSS-only architecture. `AppShell` continues to own header visibility and shell
spacing. `BoardView` continues to own the board columns and comment presentation, but derives
independent decisions for Top 10 visibility, comment sidebar visibility, and comment drawer use.
`BoardPostCard` continues to own its local like count.

This approach keeps the change focused in the existing files and matches the repository's
current state and interaction patterns.

## Responsive Layout

The board uses width-only layout tiers. Pointer type no longer changes the column structure.

### Mobile: 0–899 Pixels

- Render the post feed as the only board column.
- Hide the embedded Top 10 sidebar; keep the existing Top 10 route and board-header action.
- Open comments in the existing bottom `CommentDrawer` only after the explicit comment action.

### Compact Desktop: 900–1399 Pixels

- Render two columns: a fixed 320-pixel Top 10 sidebar and a `minmax(0, 1fr)` post feed.
- Hide the right comment sidebar.
- Open comments in the same bottom `CommentDrawer` used on mobile.
- Preserve the selected post while the drawer is open.

### Wide Desktop: 1400 Pixels and Above

- Preserve the existing three-column grid: 320-pixel Top 10, flexible post feed, and 320-pixel
  comments.
- Keep the current maximum workbench width and column gaps.
- Show the selected post's comments in the right sidebar.

`BoardView` separates the current overloaded `isContentFirstLayout` decision into focused
layout decisions such as `showTop10Sidebar`, `showCommentSidebar`, and `useCommentDrawer`.
Entering wide desktop closes only the drawer state and preserves `selectedPost`, allowing the
same comment thread to continue in the sidebar. Returning to a narrower tier does not silently
reopen a previously closed drawer; the explicit comment action opens it again.

## Collapsed Like Count and Expanded Like Action

The compact metadata row below each post title contains two quiet, non-interactive indicators:

- Existing comment icon and `post.commentCount ?? 0`.
- Heart outline icon and `currentLikeCount`.

The new collapsed like indicator has no click handler, button role, hover action, or API call.
It uses `currentLikeCount`, not the original prop, so a successful like from the expanded panel
updates the visible list count immediately.

The expanded panel retains the only interactive like button. Its authentication check, request,
success update, and warning toast remain unchanged. A failed request leaves `currentLikeCount`
unchanged. The displayed value is the application's `likeCount`; crawled `nativeLikeCount` is a
different metric and is not substituted.

## Header Reflow and Sticky Offsets

The 58-pixel header continues to hide and show only on `/board` according to the existing scroll
hook. `AppShell` derives an effective hidden state that also accounts for focus inside the header,
so visual header state and document spacing cannot disagree.

When the header is visible:

- Mobile main top offset: 74 pixels (`58 + 16`).
- Desktop main top offset: 78 pixels (`58 + 20`).

When the header is hidden:

- Mobile main top offset: 16 pixels.
- Desktop main top offset: 20 pixels.

The main top padding transitions by exactly 58 pixels using the same duration and reduced-motion
rules as the header transform. Upward scrolling or header focus restores both the header and the
original content offset.

`AppShell` exposes the current content top offset to descendants through a scoped CSS custom
property on the main element. The Top 10 sticky container, right comment container, and
`CommentSidebar` consume that property for their `top` and viewport-height calculations. Their
available height grows when the header hides, eliminating the leftover gap without adding prop
plumbing across route components. Non-board routes keep their existing fixed shell padding and
header behavior.

## State and Data Flow

### Likes

1. A post initializes `currentLikeCount` from `post.likeCount ?? 0`.
2. The collapsed indicator reads the local count without exposing an action.
3. Expanding the post reveals the existing like button.
4. A successful `addBoardLike` response replaces the local count.
5. Both collapsed and expanded displays rerender from the same value.

### Comments Across Layout Changes

1. An explicit comment action stores the selected board ID and site.
2. Mobile and compact desktop open `CommentDrawer` for that target.
3. Wide desktop displays the same target in `CommentSidebar`.
4. Crossing into wide desktop closes the drawer presentation but retains the target.
5. User-initiated close clears the drawer and selected target through the existing close flow.

### Header

1. `useHideHeaderOnScroll` produces the route-scoped scroll-hidden state.
2. AppShell combines it with header focus to produce the effective hidden state.
3. The AppBar transform, main top padding, and descendant sticky-offset variable all consume
   that same state.

## Component Boundaries

- `src/layouts/app-shell.tsx`: owns effective header state, dynamic main spacing, transition,
  focus coordination, and the descendant offset variable.
- `src/hooks/use-hide-header-on-scroll.ts`: keeps its existing scroll direction, threshold,
  reset, and cleanup responsibilities.
- `src/sections/board/view/board-view.tsx`: owns the three width tiers, column visibility,
  drawer/sidebar selection, sticky offsets, and the collapsed like indicator.
- `src/components/comment/comment-sidebar.tsx`: consumes the shared sticky offset for its
  viewport-height calculation.
- Existing API modules, hooks, Top 10 data rendering, and comment data components do not change.

## Error and Edge-Case Handling

- Like request failure: preserve the previous count and show the existing warning toast.
- Unauthenticated like attempt: preserve the existing login-required toast and do not call the
  API.
- Known zero counts: render `0` for both comments and likes.
- Compact-to-wide resize with an open drawer: close the drawer UI, retain the selected target,
  and show that target in the sidebar.
- Wide-to-compact resize: do not auto-open comments; require the explicit comment action.
- Header focus while scroll-hidden: reveal the header and restore content spacing together.
- Reduced motion: apply the final positions without animated transitions.
- Routes other than `/board`: keep the header visible and preserve current content spacing.

## Verification

Implementation follows test-first development:

1. Extend `scripts/verify-board-ui.mjs` first and confirm failures for the missing collapsed like
   indicator, three-tier layout, drawer/sidebar split, and shared header/sticky offset.
2. Preserve the existing contract that collapsed card markup cannot call `handleLike`, while
   requiring the new count to use `currentLikeCount`.
3. Keep the existing runtime scroll-hook tests. Add runtime coverage for the two stateful cases:
   header focus temporarily restores visible-header spacing while scroll-hidden, and entering the
   wide tier closes an open drawer while retaining the selected comment target for the sidebar.
4. Run the focused verifier and those runtime tests after each behavior is implemented.
5. Run the complete frontend quality gate, TypeScript, ESLint, and production build.
6. Browser-check widths 390, 899, 900, 1100, 1366, 1399, 1400, 1440, and 1536 pixels.
7. At representative widths, verify Top 10 visibility, comment presentation, readable feed
   width, non-interactive collapsed likes, expanded liking, header reflow, sticky offsets, focus
   reveal, and reduced-motion behavior.

## Acceptance Criteria

- Every collapsed board post displays its application like count.
- No collapsed like indicator can submit a like.
- The like action remains available only in the expanded post.
- A successful expanded like updates all visible count text for that card immediately.
- Hiding the board header moves the main content and sticky panes upward by exactly 58 pixels.
- Restoring or focusing the header moves those elements back without overlap.
- Below 900 pixels, the board shows only the post feed and uses the comment drawer.
- From 900 through 1399 pixels, the board keeps Top 10 and the post feed while using the comment
  drawer.
- At 1400 pixels and above, the board keeps the current three-column presentation.
- Fine and coarse pointers receive the same width-based layout at a given viewport width.
- Existing Top 10 navigation, post expansion, comments, filtering, infinite loading, and
  non-board layouts continue to work.

## Out of Scope

- Changing the board-like API, adding unlike behavior, or exposing whether the current user has
  already liked a post.
- Displaying crawled native likes in place of application likes.
- Changing Top 10 row content or the dedicated Top 10 page layout.
- Redesigning the comment drawer or sidebar contents.
- Introducing new global breakpoint values in the MUI theme.
