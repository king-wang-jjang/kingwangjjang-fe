# Board Card List Redesign Design

## Goal

Board post cards should read as quiet, scannable list items instead of heavy content tiles.

## Approved Direction

Use a quiet list-style card.

Collapsed cards:

- Prioritize title, site, age, comment count, and like count.
- Remove the large site placeholder block.
- Keep only a small, low-emphasis site marker when no thumbnail exists.
- Use orange sparingly for selected or hover emphasis.
- Keep the expand affordance small at the right edge.

Expanded cards:

- Clicking a card expands it and selects that post for comments.
- Clicking an already expanded card keeps it expanded and re-selects that post for comments.
- Collapse is only available through an `X` control inside the expanded area, aligned to the expanded area's top-right.
- Summary content appears in a quiet body block.
- `원문 바로가기` and `댓글 열기` remain at the bottom as small secondary actions, not dominant CTA buttons.

## Scope

Only `BoardPostCard` visual structure and its direct contract tests change. Board layout, comment sidebar, data fetching, and app shell remain unchanged.
