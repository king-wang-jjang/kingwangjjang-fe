# Board Workbench Redesign Design

## Summary

Redesign `/board` as a PostHog-inspired reading workbench for scanning posts and discussing them without leaving the page. The approved direction is a dense three-pane desktop layout with a compact mobile adaptation:

- Left pane: workspace navigation, account/login entry, and site filters.
- Center pane: live board feed with richer post cards and clear read/selected states.
- Right pane: comment panel for the selected post.
- Mobile: single-column feed, compact filter bar, and the existing comment drawer pattern restyled to match the new system.

The visual language should be original to Kingwangjjang. It may use the warm, scrappy, editorial spirit from `DESIGN.md`, but it must not copy PostHog's mascot, illustrations, copy, or brand assets.

## Goals

- Apply the `DESIGN.md` system across the visible `/board` experience: shell, feed, filters, login area, post cards, comments, dialogs, loading, empty, and error states.
- Replace the current white/green MUI look with warm parchment, olive text, sage borders, compact radii, and orange hover accents.
- Preserve existing product behavior: infinite board loading, site filtering, read tracking, like action, source link, image preview, comment sidebar on desktop, and comment drawer on mobile.
- Improve scan efficiency for repeated use. The board should feel like a work tool, not a landing page.
- Keep implementation scoped to frontend UI/UX. No backend or API contract changes.

## Non-Goals

- Do not add new board data features such as search, sorting, saved filters, or recommendations.
- Do not change authentication or OAuth behavior.
- Do not replace MUI with Tailwind, Radix, or shadcn/ui. The app remains Next.js 14 + MUI 5.
- Do not use copied PostHog images, hedgehog art, or trademarked visual assets.
- Do not redesign non-board routes beyond shared app chrome required by `/board`.

## Considered Approaches

### A. Editorial Feed

Keep the current feed-first layout and restyle it with the new palette. This has the lowest risk, but it underuses the desktop width and keeps login/filter/comment concerns visually scattered.

### B. Reading Workbench

Use a three-pane desktop tool layout: left tools, center feed, right comments. This is the selected approach because the app's primary task is scanning and discussing posts in one session. It preserves behavior while making the screen more focused and professional.

### C. Magazine Front Page

Create an editorial homepage with highlighted posts and feature blocks. This is visually distinctive, but it changes the product mental model too much and would require new prioritization logic.

## Approved UI Architecture

### App Shell

- Page background: Warm Parchment `#fdfdf8`.
- Header: compact fixed top bar with sage border, original logo treatment, and olive text.
- Navigation: warm background, 15px semibold labels, selected state using sage surface and deep olive text. Hover text flashes PostHog Orange `#F54E00`.
- Avoid large decorative cards in the shell. The shell should be quiet and utilitarian.

### Desktop Board Layout

Use a three-column workbench inside a wide constrained container:

- Left column around 220-260px: workspace label, login/account area, site filters, and compact utility controls.
- Center column flexible: feed title/summary, active filter chips, post list, loading sentinel.
- Right column around 320-380px: sticky comment panel when a post is selected. Empty state can be a subtle placeholder or blank surface.

All columns use flat surfaces, sage borders, and 4px-6px radii. Shadow is reserved for dialogs, menus, drawers, and image preview.

### Mobile Board Layout

- Collapse to a single feed column.
- Move filters into a compact bar above the feed.
- Keep comments in the existing drawer flow, restyled with the new surface and typography rules.
- Preserve large enough touch targets even though the desktop design is compact.

## Visual System

### Colors

- Page background: Warm Parchment `#fdfdf8`.
- Main surface: `#fdfdf8` or white only for high-emphasis feed cards.
- Secondary surface: Sage Cream `#eeefe9`.
- Tertiary/control surface: Light Sage `#e5e7e0`.
- Primary text: Olive Ink `#4d4f46`.
- Strong text/headings: Deep Olive `#23251d`.
- Secondary text: Muted Olive `#65675e`.
- Borders: Sage Border `#bfc1b7` and Light Border `#b6b7af`.
- Hover/active accent: Orange `#F54E00`.
- Primary button: Near Black `#1e1f23` with white text.
- Focus ring: accessible blue `#3b82f6` at partial opacity.

Avoid blue/purple SaaS accents except for keyboard focus.

### Typography

- Replace Inter with IBM Plex Sans Variable if available through package or CSS import. Fallback to system UI fonts.
- Headings: 700-800 weight, deep olive, generous line height.
- Body text: 15-16px, 1.5-1.7 line height for readable post summaries and comments.
- UI labels: 13-15px semibold.
- Category labels can use uppercase sparingly for left-pane section labels.
- Keep letter spacing at `0` unless matching `DESIGN.md` for major headings. Do not use viewport-scaled font sizes.

### Shape and Depth

- Default radius: 4px.
- Larger controls/dialog triggers: 6px.
- Pills/badges: 9999px.
- No gradients, glow, glass effects, or heavy card shadows.
- Use one deep shadow only for floating elements such as menus, dialogs, and drawers.

## Component Design

### Filters

- Desktop filters live in the left pane and active filter chips can also appear near the feed heading.
- Filter menu/buttons use sage surfaces and sage borders.
- Active filters should be compact pills with clear remove affordances.
- Reset action should be available only when filters are active.

### Post Cards

- Unread cards use a higher-emphasis surface, strong deep-olive title, and clear site/time metadata.
- Read cards reduce emphasis through sage background or opacity without making text hard to read.
- Selected card uses orange border/text accents, not a large color fill.
- Thumbnail treatment remains square or near-square with 4px radius and sage border/surface fallback.
- Actions for comments, likes, source link, and expand/collapse remain visible and compact.
- Hover state should reveal orange text/icon accents. Existing desktop source-link slide behavior can remain if it feels stable after restyling.

### Comments

- Desktop comments are a sticky right pane with a header, scrollable list, and composer footer.
- Mobile comments remain a drawer.
- Comment items use parchment cards over sage panel surface.
- Replies use indentation and/or a subtle left border, not heavy nesting cards.
- Like/reply/delete actions use compact text/icon controls with orange hover.

### Login/Account Area

- Keep existing OAuth/login behavior.
- Visually move the login entry into the left pane so it reads as part of the workspace tooling.
- Use dark primary CTA only for the main login/action button.

### Image Preview and Menus

- Dialogs and menus use the single deep shadow from `DESIGN.md`.
- Image preview background can remain dark for contrast, but close controls should match the compact 4px-6px radius system.

## States

- Loading: skeletons should use sage surfaces and preserve the post card dimensions.
- Empty feed: parchment/sage bordered panel with direct, Korean copy and a reset-filter action when applicable.
- Error: warning state should use the system palette where possible, but remain accessible and obvious.
- No selected comment: on desktop, show a subtle right-pane placeholder or leave a stable empty surface so the grid does not jump.
- Unauthenticated like action: keep the existing toast behavior, restyled by global theme/toaster where feasible.

## Accessibility

- Maintain semantic buttons and links for actions.
- Preserve visible keyboard focus using the focus blue ring.
- Ensure orange hover is not the only state indicator for selected cards or active filters.
- Keep text contrast high on parchment and sage surfaces.
- Do not place text over decorative illustrations.
- Touch targets on mobile should remain comfortable even when desktop controls are compact.

## Data and Behavior Flow

- `useBoard` remains the data source for posts, loading, errors, and filter collection.
- `useReadStore` continues to mark posts as read on open/source/comment interactions.
- `addBoardLike` remains the like action and updates local card state.
- `useComments` continues to load and mutate comments for selected posts.
- Selecting a post sets `{ boardId, site }`; desktop opens the right pane, mobile opens the drawer.
- Filtering can clear selected post if it is no longer visible.

## Testing and Verification

- Add focused tests or verification scripts for structural UI expectations if the project has no browser test framework.
- Update `scripts/verify-board-ui.mjs` because it currently asserts legacy white/green theme and legacy grid details that this redesign intentionally changes.
- Run `npm run ts` and `npm run lint`.
- Run `npm run build` if TypeScript/lint passes.
- Manually verify desktop and mobile viewports in the browser:
  - desktop workbench columns render without overlap,
  - mobile filter/feed/drawer flow works,
  - post actions still work,
  - long Korean text wraps without overflowing,
  - image preview opens and closes,
  - comments open, submit, reply, and like paths remain reachable.

## Implementation Boundaries

Expected frontend files to touch:

- `src/theme/app-theme-provider.tsx`
- `src/global.css`
- `src/app/layout.tsx`
- `src/layouts/app-shell.tsx`
- `src/sections/board/view/board-view.tsx`
- `src/components/comment/*`
- `src/auth/components/form-oauth.tsx` if login styling needs local adjustment
- `scripts/verify-board-ui.mjs`

Avoid unrelated API, hook, or store changes unless a UI integration bug requires them.

## Risks

- The existing repository has unrelated dirty changes. Implementation must preserve them and avoid broad formatting churn.
- Some current Korean strings appear mojibake in source files. The redesign should replace visible UI copy touched in the work with valid UTF-8 Korean text.
- `DESIGN.md` references Tailwind/Radix/shadcn, but this repo uses MUI. The implementation should translate the design language into MUI theme and `sx` patterns rather than adding a new UI stack.
- The palette is intentionally warm and earthy; overusing one hue can make the interface feel flat. Use parchment, sage, white, deep olive, and orange states deliberately to preserve hierarchy.
