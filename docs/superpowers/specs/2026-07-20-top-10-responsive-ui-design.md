# Top 10 Responsive UI Design

## Goal

Surface the existing daily popularity ranking as a compact Top 10 experience. On desktop it should stay visible as a floating left sidebar while the user reads the realtime feed. On mobile it should live at its own `/top10` route so the ranking remains readable and directly linkable without competing with the feed. Consolidate the site filters into the realtime-board header so the title, context, and current filtering state stay together at every responsive width.

## Ranking Definition

Top 10 means the first ten posts returned by the existing daily ranking endpoint. The frontend will call `getDailyBoards(0, 10)`, which is already backed by `daily_score` ordering in board-service. This change does not introduce a new ranking formula or backend endpoint.

The API response order is authoritative. The UI assigns visible positions 1 through 10 from that order and does not re-sort client-side.

## Architecture

The feature is split into three focused units:

- `useTopBoards` owns React Query state for the daily Top 10 request under a stable `['boards', 'daily', 'top10']` cache key.
- `Top10List` renders the shared ranking content, including loading, error, empty, and populated states. It supports a compact sidebar presentation and a roomier page presentation without duplicating ranking logic.
- `/top10` is a dedicated App Router page wrapped in the existing `AppShell`. The board page embeds the compact presentation in its existing left workbench column.

No ranking request is added to the global app shell. The query runs only on the board page and the dedicated Top 10 page, keeping unrelated account routes free of ranking data dependencies.

## Desktop Experience

At desktop widths, the current 320-pixel left workbench column contains only the sticky Top 10 card positioned below the fixed header. The existing `Workspace` / `Sites` filter card is removed. The ranking card has a viewport-bounded height and vertical overflow so all ten rows remain reachable on shorter screens while the center feed scrolls independently.

The card header reads `오늘의 TOP 10`. Each row contains:

- A visible rank number, with ranks 1–3 emphasized and ranks 4–10 using the quieter sage treatment.
- The source site label.
- A title clamped to two lines.
- A subtle external-link affordance.

Selecting a row opens the original post URL in a new tab with `noopener` and `noreferrer`. Daily-ranked posts may not exist in the currently loaded realtime page, so the sidebar will not try to select or scroll the center feed.

## Board Header Filter Consolidation

The `실시간 게시판` header becomes the single home for site filtering on desktop, tablet, and mobile. Its first row keeps the title and description on the left, with the existing responsive `TOP 10` action and post count on the right.

A second row always appears directly below the title row:

- The filter icon opens the existing site-selection menu.
- Selected-site chips show the active filters and retain their existing remove interaction.
- The reset action appears whenever one or more sites are selected.
- Chips wrap onto additional lines when horizontal space is limited instead of creating a separate card.

The existing selected-site state, labels, menu, toggle handlers, and board-query behavior remain unchanged. Only their presentation moves: filter markup is removed from the desktop left column and the standalone responsive filter card is removed, preventing duplicate filter controls and `Workspace` / `Sites` headings.

## Mobile Experience

The desktop ranking card is hidden when the board switches to its content-first responsive layout. Mobile users reach the ranking through a `TOP 10` item in the hamburger navigation and a compact `TOP 10` action in the board header. Both navigate to `/top10` and create normal browser history. Site filters remain in the board header's second row; no separate mobile filter card is rendered.

The dedicated page uses the same ordered list with larger row padding and touch targets. It includes a clear page heading, a short description, and a `실시간 게시판` navigation action. The page remains valid at desktop widths when opened directly, but the primary desktop experience is the floating sidebar.

For coarse-pointer tablet layouts where the board already suppresses side columns, the board-header action keeps the dedicated page reachable even when the hamburger button is not shown.

## Data Freshness And States

React Query shares the result between the board sidebar and `/top10`, uses a short stale window appropriate for a daily ranking, and preserves the last successful data while refetching.

- Loading: rank-shaped skeleton rows reserve the final layout.
- Error: a concise failure message and retry action are shown inside the card or page.
- Empty: the UI explains that ranking data is not available yet.
- Partial response: every returned item is rendered, up to ten; the UI does not invent missing ranks.

## Visual And Accessibility Rules

The feature follows the existing warm parchment, sage border, deep olive text, and orange interaction palette. It uses the established 4–6 pixel corner radius and avoids introducing a new visual system.

The ranking is an ordered list with semantic link rows. Keyboard focus is visible, titles remain available to assistive technology even when visually clamped, and the external-navigation label communicates that the original post opens in a new tab. Touch rows meet the existing mobile target sizing.

The header filter icon has an accessible label, selected chips remain individually removable, and the reset action is keyboard reachable. Wrapping preserves the complete filter state without horizontal clipping.

## Verification

A source-level contract verifier will be added before implementation, following the repository's existing `scripts/verify-*.mjs` convention. It will check the ten-item daily request, shared list usage, desktop sticky placement, responsive hiding, mobile navigation, and `/top10` route. It will also verify that filter controls live inside the feed header, the desktop workbench contains only Top 10, and the former standalone responsive filter card is absent. The normal TypeScript, ESLint, formatter, and production build checks will also run.

Browser verification will cover a desktop viewport and a mobile viewport, confirming that the sidebar and page are mutually appropriate, the integrated filter row wraps cleanly, all states fit the layout, and ranking links behave as external links.

## Out Of Scope

- Changing the popularity algorithm or adding backend endpoints.
- Site-specific Top 10 tabs, date pickers, or ranking history.
- Opening comments or synchronizing a ranked item with the realtime feed.
- Persisting a user-selected ranking mode.
