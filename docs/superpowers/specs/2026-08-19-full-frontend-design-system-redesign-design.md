# Full Frontend Design System Redesign

## Status

- Approved by the user on 2026-08-19.
- Target repository: `kingwangjjang-fe`.
- Audited and documented against `develop` at `2994eef`.
- Scope: the complete frontend, including both dark and light color schemes.

## Source Material

This design follows the local redesign package in the workspace root:

- `../.agents/agent-guide.md`
- `../.agents/REFERENCE_NOTES.md`
- `../.agents/references/current/desktop.png`
- `../.agents/references/current/mobile.png`
- `../.agents/references/current/detail.png`
- `../.agents/references/phantom/01-terminal-desktop.jpg`
- `../.agents/references/phantom/02-connection-options.png`
- `../.agents/references/phantom/03-money-app-visual.jpg`
- `../.agents/references/phantom/04-cash-visual.jpg`
- `../.agents/references/phantom/05-mobile-product-ui.png`

The `current` images define the functional and information-density baseline. The Phantom images
are references for hierarchy, surfaces, compact controls, and feedback. Phantom branding,
graphics, purple palette, typography, and decorative 3D objects will not be copied.

## Goal

Turn the frontend into one maintainable product system while preserving the service's main
strength: users can enter the board and scan many posts quickly.

The redesign must achieve all of the following:

1. Make the most important information apparent faster.
2. Preserve dense post scanning and in-context detail expansion.
3. Make selection, filtering, comments, likes, analysis, loading, and errors feel immediate.
4. Apply one recognizable design language to Board, Top 10, Comments, Account, Admin, loading,
   and not-found screens.
5. Keep dark and light modes on the same semantic token and component contracts.
6. Reduce large view files and page-specific styling without creating an over-abstracted UI
   framework.

## Audited Baseline

The frontend uses Next.js 16 App Router, React 19, TypeScript, MUI 9 with Emotion, TanStack Query,
and Zustand.

Current routes and responsibilities:

- `/` redirects to `/board`.
- `/board` renders the live board workbench.
- `/top10` renders the ranked, expandable Top 10 page.
- `/account/settings` and `/account/history` render account surfaces.
- `/admin/shorts` renders the guarded Shorts administration workspace.
- `AppShell` owns the fixed header, authentication/profile actions, theme toggle, and mobile
  navigation drawer.

Current structural pressure points:

- `src/sections/board/view/board-view.tsx` is 1,249 lines and combines orchestration, responsive
  layout, filtering, analysis polling, card presentation, selection, details, likes, and comments.
- `src/components/top10/top10-list.tsx` is 651 lines and combines sidebar and page variants.
- Styling is concentrated in MUI `sx` objects, including repeated surface, border, spacing, and
  state decisions.
- UI contract scripts assert some implementation literals and must be moved toward user-visible
  behavior and stable component contracts.
- Dark mode has a stronger identity than light mode; the new system gives both schemes complete
  semantic definitions.

Existing API contracts, query keys, authentication, read history, analysis jobs, comments,
likes, pagination, and infinite loading are valid and must be preserved.

## Chosen Approach

Use a shared design system plus feature modules.

The rejected alternatives were:

- A theme-only overlay. It would be faster initially but would preserve the large view files and
  repeated page-level decisions.
- A schema-driven UI platform. It would maximize abstraction but add more indirection than this
  application's size and feature set justify.

The selected approach centralizes visual decisions while leaving each feature in control of its
own data and behavior.

## Resolved Source Ambiguities

The source package left several choices open. This design resolves them as follows:

- The actual `references/current/...` paths are authoritative over the flattened paths written in
  the guide.
- The responsive boundaries are exactly 900px and 1400px.
- Removing the right rail at narrower widths means moving comments to the existing sheet, not
  deleting comment functionality.
- The global motion cap wins: context content moves at most 2px, not 4–8px.
- When useful pulse data cannot be derived from loaded posts, the idle rail shows an instructional
  empty state rather than invented metrics.
- Light mode uses the complete token table in this document and is not treated as a fallback.
- No new 2D or 3D decorative marketing object is added to application screens.

## Scope

### In Scope

- Theme foundations and MUI component overrides.
- Shared presentation components.
- Global header, navigation, profile/login surfaces, and mobile drawer.
- Board toolbar, feed, cards, expanded details, Top 10 rail, context rail, and comments.
- Dedicated Top 10 page.
- Account settings and history.
- Admin Shorts workspace.
- Loading, empty, locked, error, and not-found states.
- Light and dark color schemes.
- Browser/PWA theme colors in the application metadata and manifest.
- Responsive, keyboard, touch, reduced-motion, and visual verification.
- Updating relevant tests and verifier scripts with the implementation.

### Out of Scope

- Backend or API contract changes.
- New search, sorting, writing, real-time subscription, or analytics features.
- Fabricated data for a Live Pulse panel.
- Replacing TanStack Query or Zustand.
- Changing authentication or permission rules.
- Replacing pagination or infinite loading behavior.
- New autoplay video, canvas backgrounds, particles, or decorative 3D assets.
- Copying Phantom brand assets or visual identity.

## Architecture

The frontend uses three layers.

### 1. Theme Foundations

Theme foundations are the single source of truth for:

- semantic colors;
- typography;
- spacing usage;
- shape;
- layout constants;
- motion;
- focus treatment;
- MUI component overrides.

Proposed files:

```text
src/theme/
  foundations.ts
  component-overrides.ts
  app-theme-provider.tsx
  constants.ts
```

`app-theme-provider.tsx` assembles the theme and providers. It does not contain every token and
component override inline.

### 2. Shared Presentation Components

Shared components know nothing about board IDs, API clients, query keys, authentication stores,
or feature-specific data models.

Proposed components:

```text
src/components/ui/
  app-surface.tsx
  section-heading.tsx
  status-chip.tsx
  state-panel.tsx
  metric.tsx
  action-row.tsx
  responsive-sheet.tsx
```

Only repeated presentation with a stable purpose becomes shared UI. Variants are named after
intent, such as `raised`, `interactive`, `loading`, or `error`; page names are not used as generic
variants.

### 3. Feature Modules

Feature modules own data hooks, events, responsive presentation choices, and domain state. They
compose shared UI instead of duplicating visual rules.

The board is split without moving unrelated application code:

```text
src/sections/board/
  view/board-view.tsx
  components/board-toolbar.tsx
  components/board-feed.tsx
  components/board-post-card.tsx
  components/board-post-detail.tsx
  components/board-context-rail.tsx
  components/board-feed-pulse.tsx
  board-view-model.ts
```

`BoardView` remains the orchestration boundary for filters, selected post, viewport presentation,
analysis state, and existing hooks. It should no longer contain all card and detail markup.

Top 10 separates the compact rail from the expandable page while reusing stable row primitives.
Comments retain their current query and mutation ownership. Account and Admin remain purpose-built
screens and reuse shared surfaces, headings, state panels, and control styling.

### Boundary Rules

- Shared UI does not fetch data.
- Feature components do not contain raw brand hex values, arbitrary transition durations, or
  scheme-specific JSX branches.
- Existing API modules and query hooks are not moved merely to match the visual refactor.
- No universal schema renderer or slot framework is introduced.

## Semantic Design System

### Color Roles

The screen remains 85–90% neutral. Accent colors communicate purpose rather than decoration.

| Role | Dark | Light | Use |
| --- | --- | --- | --- |
| Canvas | `#10130F` | `#F6F7F1` | Application background |
| Surface 1 | `#151914` | `#FFFFFF` | Standard panel and card |
| Surface 2 | `#1B2019` | `#EAEEE7` | Selected, grouped, or raised area |
| Surface 3 | `#22281F` | `#DDE4DA` | Strong control or nested surface |
| Text primary | `#F4F5EF` | `#1C211A` | Titles and primary content |
| Text secondary | `#AEB4A8` | `#626B5E` | Descriptions and metadata |
| Text tertiary | `#7F877A` | `#7B8577` | Quiet labels and disabled text |
| Border subtle | `rgba(235,241,228,.10)` | `rgba(28,33,26,.12)` | Default separation |
| Border strong | `rgba(235,241,228,.20)` | `rgba(28,33,26,.24)` | Hover, focus support, important separation |
| Action yellow | `#F4EA16` | `#D8CC00` | Login and highest-priority action |
| On action | `#171914` | `#171914` | Text on yellow |
| Interactive cyan | `#63D8DA` | `#087E82` | Selection, focus, links, active controls |
| Signal pink | `#EE7196` | `#B83F61` | HOT, new activity, and movement |
| Danger | `#FF675F` | `#C33D36` | Errors and destructive feedback |

MUI `primary` maps to the action role, `secondary` maps to the interactive role, and `error` maps
to danger. A typed custom `signal` palette role represents pink. New feature code should prefer
semantic palette paths rather than raw values.

Existing extended background roles remain typed but receive explicit meanings:

- `background.default`: canvas;
- `background.paper`: Surface 1;
- `background.subtle`: Surface 2;
- `background.muted`: Surface 3;
- `background.hover`: a scheme-specific interactive surface;
- `background.read`: a quiet read-history state;
- `background.raised`: a selected or floating surface;
- `background.warm`: a restrained login or warning surface;
- `background.soft`: grouped form and settings rows.

### Typography

Keep the installed IBM Plex Sans Variable stack and the current system fallback for Korean. Do
not add a remote font dependency during the redesign.

| Element | Desktop | Mobile | Weight |
| --- | --- | --- | --- |
| Board title | 28–30px | 24–26px | 800 |
| Page title | 26–28px | 22–24px | 800 |
| Post title | 16–18px | 16–18px | 700 |
| Rail heading | 16–18px | 16px | 800 |
| Body | 14–16px | 14–16px | 400–500 |
| Category and metadata | 12–13px | 12–13px | 600–700 |

Post titles remain the strongest element inside feed cards. No landing-page-scale headline is
introduced.

### Spacing and Shape

Keep MUI's 8px spacing base so existing values remain understandable. Allowed design increments
are `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, and `4`, producing 4, 8, 12, 16, 20, 24, and 32 pixels.

Shape rules:

- controls: 8px;
- feed cards and grouped rows: 12–14px;
- thumbnails: 8–10px;
- panels and sheets: 16px;
- chips: pill radius;
- large 24–32px radii are not used for ordinary content cards.

Set the base MUI shape radius to 8px and express larger roles through shared components and
component overrides.

### Motion

- Standard duration: 160–200ms.
- Maximum translation: 1px for cards and 2px for panel content transitions.
- Maximum scale: 1.02, limited to thumbnails.
- Animate opacity, background, border, and transform only.
- Do not animate layout dimensions in ways that cause content shift.
- Disable nonessential motion under `prefers-reduced-motion`.
- No ticker, particle, canvas, continuous gradient, or universal glow effect.

The global 2px translation limit resolves the source guide's conflicting 4–8px right-rail
recommendation.

## Global Shell and Navigation

Keep the 58px fixed header height and the existing board-only hide-on-scroll behavior. Header
visibility, main top spacing, focus reveal, and sticky offsets continue to use one state source.

Desktop header contents:

- existing logo linking to `/board`;
- real `/board` and `/top10` navigation;
- theme toggle;
- existing login or profile control.

Mobile header contents:

- logo;
- theme toggle;
- login or profile;
- menu button.

Search, category navigation, and writing controls are not added because the current frontend does
not provide those capabilities. The shell uses the same semantic surfaces in both schemes.

Existing logo and favicon assets remain unchanged. The legacy white/green values in
`public/manifest.json` are replaced with the new canvas/theme colors, and application metadata uses
scheme-aware browser theme colors where the current Next.js metadata API supports them.

## Responsive Layout

### Shared Breakpoints

| Range | Board layout | Comment presentation | Top 10 presentation |
| --- | --- | --- | --- |
| `>= 1400px` | Three columns | Right sidebar | Left rail |
| `900–1399px` | Two columns | Bottom sheet/drawer | Left rail |
| `< 900px` | Single feed | Bottom sheet/drawer | Compact entry point and dedicated route |

The shell uses horizontal padding of 12px on the smallest screens, 16px from the small range, and
24px on large screens. The board content is centered.

### Wide Board

At 1400px and above:

```text
260px Top 10 | 16px gap | minmax(640px, 820px) Feed | 16px gap | 300px Context
```

The maximum workbench width is 1412px. The center feed remains the strongest surface and first
viewport shows at least four to six post titles.

### Compact Board

From 900 through 1399px:

```text
clamp(220px, 24vw, 240px) Top 10 | 16px gap | minmax(0, 820px) Feed
```

The compact workbench maxes out at 1076px. Comments open in the existing responsive sheet. The
right rail disappears before the Top 10 rail so the feed keeps a usable reading width.

### Mobile Board

Below 900px:

- render one feed column;
- compress the board heading and real filter controls into one compact toolbar;
- retain a clear Top 10 route action;
- open comments only after an explicit action;
- show the first complete post card and part of the next card in the initial viewport when content
  length permits;
- do not rely on hover.

### Other Screens

- Top 10: a focused ranked list with expansion and comment sheet, centered at an appropriate
  reading width.
- Account: a maximum 920px grouped settings/history layout using shared surfaces and rows.
- Admin Shorts: a wider, high-density workspace up to 1200px.
- Loading and not-found: centered shared `StatePanel` presentations.

All screens share the shell and design language; they are not forced into the board's three-column
composition.

## Feature Design

### Board Toolbar

The toolbar combines the board title, current site filters, Top 10 entry point on narrow screens,
and filter menu. It exposes only implemented behavior.

The existing title `실시간 게시판` may remain. A LIVE indicator is not shown unless the data is
actually refreshed by a real existing mechanism. No fake new-post count, search, sort, or category
control is rendered.

### Feed Card

Collapsed card content remains:

- source/category;
- relative time;
- title, clamped to two lines;
- application comment and like counts;
- thumbnail or existing fallback.

Default state:

- Surface 1;
- subtle border;
- 12–14px radius;
- 14–18px effective padding;
- title is the strongest element.

Hover on fine pointers:

- move to Surface 2;
- strengthen the border;
- translate at most `-1px`;
- scale the thumbnail at most `1.02`.

Focus:

- 3px interactive-cyan ring with offset;
- no layout movement;
- visible focus is not replaced by hover styling.

Selected state:

- 3px left selection bar;
- Surface 2 or raised surface;
- interactive border;
- visible or assistive `선택됨` state so color is not the only cue;
- no strong orange warning-like outline.

Expanded state:

1. source/time and thumbnail;
2. title and engagement metrics;
3. summary or compact locked-summary panel;
4. collected source excerpt;
5. action row.

Action priority is comments, source, then like. The like action remains available only in the
expanded state. The collapsed count is informative and cannot submit a like. The active comment
action uses interactive cyan; yellow remains reserved for login and the highest-priority global
action.

### Top 10

- Keep Top 10 as a primary discovery feature.
- Emphasize ranks 1–3 with 20–24px numbers.
- Render ranks 4–10 as compact rows.
- Use rhythm and surface changes instead of a strong border around every row.
- Make each valid row clickable and keyboard accessible.
- Clamp long titles and retain the dedicated route.
- Keep page-row comments keyed by the real board database ID.

### Context Rail

The wide-screen context rail is a single stable panel with five explicit states:

1. Idle: facts derived only from the currently loaded board data, such as loaded post count,
   distinct sites, newest timestamp, and the most discussed loaded post.
2. Selected: selected-post context is retained.
3. Comments: comments, form, and replies for the selected database ID.
4. Loading: size-reserved skeleton.
5. Error: compact retry state without removing the panel.

If loaded data cannot support useful facts, the idle panel shows a concise instruction to select
a post. It never fabricates activity or backend metrics.

### Comments Across Width Changes

- An explicit comment action stores board ID and site.
- Below 1400px, the target opens in the existing drawer/sheet.
- At 1400px and above, the same target renders in the right sidebar.
- Entering wide mode closes only drawer presentation and preserves the target.
- Leaving wide mode preserves the target but does not automatically open a drawer.
- User-initiated close clears both presentation and selected target through the current close flow.

### Account

Settings and history use the same page heading, grouped surface, row, divider, icon, chevron, form,
empty, and loading patterns. Each row has one purpose. Account pages keep their focused width and
do not adopt the board grid.

### Admin Shorts

The admin workspace uses the same tokens and controls with denser panels and status badges. Status
always includes text, not color alone. Existing admin permissions and data flow remain unchanged.

### Shared States

`StatePanel` covers:

- loading;
- empty;
- error with retry;
- locked/auth required;
- not found.

The component reserves appropriate space, accepts concise copy and an optional action, and does not
own data fetching.

## Data and State Flow

### Existing Data Layer

Preserve:

- `useBoard` and board filters;
- TanStack Query cache and infinite queries;
- `useComments` and the `['comments', boardId]` contract;
- Top 10 hooks and existing date/rank behavior;
- Zustand auth and read-history stores;
- board analysis request and polling contracts;
- like and user APIs.

Presentation components receive explicit data and callbacks. They do not import API modules.

### Board Selection

1. A feed card emits the selected post.
2. `BoardView` stores the board ID and site.
3. The card expands in place and the context region receives the same target.
4. An explicit comment action decides whether to use the sidebar or sheet.
5. Filtering out the selected post clears selection through the existing visibility rule.

### Likes

1. A card initializes local application-like count from `post.likeCount`.
2. The collapsed metadata displays the count without an action.
3. The expanded like button keeps the existing authentication check.
4. Success replaces the local count.
5. Failure preserves the previous count and uses the existing warning feedback.

### Analysis

Analysis remains an authenticated, selected-post flow using the current job and polling contracts.
Refactoring presentation must not create duplicate requests or change polling semantics. Pending,
processing, completed, failed, and locked states receive consistent visual treatment.

### Theme and Header

Theme storage and system preference behavior remain intact. Header transform, main content offset,
focus reveal, and descendant sticky offset continue to derive from the same header state.

## Error and Edge Cases

| Situation | Preserve | Feedback |
| --- | --- | --- |
| Initial feed failure | Filter selection | Full feed `StatePanel` with retry |
| Infinite-load failure | Loaded posts and scroll context | Inline retry near list end |
| Like failure | Previous count and expanded state | Existing warning toast |
| Comments failure | Selected post and open panel | Inline comment retry |
| Analysis failure | Expanded post and source content | Summary error state plus existing toast |
| Thumbnail failure | Reserved card geometry | Existing fallback behavior |
| Unauthenticated summary | Post and detail content | Compact locked-summary panel |
| Empty filter result | Active filters | Empty state with clear/change-filter action when available |
| Missing Top 10 board ID | Row content | Disabled comment action; no fallback thread ID |
| Long title | Card geometry | Two-line clamp collapsed; complete title expanded |
| Scheme change | Current route and state | Token-only visual update; no scheme-specific remount |

## Accessibility

Required:

- keyboard access to cards, rows, tabs, filters, menus, drawers, actions, and retry controls;
- `focus-visible` treatment with sufficient contrast;
- correct button, link, tab, dialog, and list semantics;
- `aria-selected` or equivalent selected-state semantics where appropriate;
- `aria-label` for icon-only controls;
- thumbnail `alt` text or deliberate decorative treatment;
- no status communicated by color alone;
- touch targets of 40–44px where practical;
- focus trapping and return for drawers/dialogs;
- reduced-motion support;
- light and dark contrast verification.

## Performance

- Preserve current fetching, query caching, pagination, and infinite-loading behavior.
- Do not add a client-side state library.
- Memoize only stable derived view models where measurement shows value.
- Reserve thumbnail dimensions and keep object-fit behavior.
- Keep lazy loading for offscreen thumbnails where supported.
- Avoid remounting lists when the color scheme or context-panel state changes.
- Avoid background video, canvas, particle, and continuous animation work.

## Verification Strategy

Implementation follows test-first changes for each behavior slice.

### Automated Checks

1. Theme and shared UI tests:
   - semantic roles exist in both schemes;
   - focus and reduced-motion contracts;
   - shared state variants and actions.
2. Feature runtime tests:
   - filters and infinite loading;
   - selection and expansion;
   - informative collapsed likes and expanded like action;
   - authentication locks;
   - real board IDs for comments;
   - responsive drawer/sidebar transitions;
   - header reveal and content offsets.
3. Existing verifier scripts:
   - update them with the refactor;
   - retain stable feature contracts;
   - remove dependence on exact `sx` literals or incidental function names where runtime coverage
     is practical.
4. Quality commands:
   - focused Vitest files during each slice;
   - `yarn test`;
   - `yarn ts`;
   - `yarn lint`;
   - `yarn check`;
   - `yarn build`.

### Browser Verification

Verify at:

- 360, 390, 430, and 768px;
- 899 and 900px boundary;
- 1024 and 1280px;
- 1399 and 1400px boundary;
- 1440 and 1536px.

At representative widths, verify:

- first-viewport content density;
- both color schemes;
- header hide, reveal, focus, and content reflow;
- Top 10 rail, page, expansion, and navigation;
- filter menu;
- collapsed, hover/focus, selected, and expanded post states;
- comments sidebar and sheet;
- authenticated and unauthenticated states;
- likes and analysis;
- long title and missing thumbnail;
- loading, empty, error, locked, and retry;
- keyboard, touch, and reduced motion.

Final delivery includes desktop, mobile, and selected/detail screenshots.

## Implementation Order

1. Add failing theme and shared-component contracts.
2. Extract theme foundations and MUI overrides.
3. Add shared UI primitives.
4. Redesign `AppShell` while preserving header behavior and authentication.
5. Split and redesign the board toolbar, feed, post card, detail, and context rail.
6. Redesign Top 10 rail and page.
7. Apply shared design to comments.
8. Apply shared design to Account and Admin.
9. Apply shared states to loading and not-found screens.
10. Complete responsive, accessibility, motion, and performance passes.
11. Run the full automated and browser verification matrix.

## Migration and Repository Safety

- The main `develop` worktree was clean and fast-forwarded to `2994eef` before this document was
  written.
- `.worktrees/crawl-summary-admin` contains separate uncommitted user work that overlaps board and
  Top 10 files. The redesign must not edit, delete, move, format, or clean that worktree.
- Implementation remains on the main worktree unless a later approved plan creates a new isolated
  worktree.
- Shared component extraction should be incremental so each step leaves the application runnable.
- No bulk formatting or unrelated refactoring is included.

## Acceptance Criteria

- All frontend screens use one semantic design system.
- Dark and light schemes are complete and do not require scheme-specific feature JSX.
- Board, Top 10, comments, likes, analysis, auth, theme, pagination, and responsive behavior retain
  their existing functional contracts.
- The board shows at least four to six post titles in the first wide desktop viewport.
- Wide, compact, and mobile layouts match the approved 1400px and 900px boundaries.
- The right rail never presents fabricated data.
- Default, selected, expanded, loading, empty, error, and locked states are visually and
  semantically distinct.
- Keyboard, touch, focus, contrast, and reduced-motion requirements pass.
- Large feature files are decomposed into focused presentation and orchestration units.
- No raw brand color or ad hoc motion value is introduced in feature components.
- Automated quality gates and the browser verification matrix pass.
- Final desktop, mobile, and selected/detail screenshots demonstrate the completed redesign.
