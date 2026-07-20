# Board Thumbnail Crop Design

## Goal

Keep realtime-board cards compact when a post has a tall thumbnail. The list thumbnail should be cropped into a stable square, while the existing image dialog continues to show the complete image after selection.

## Root Cause

The side-image slot currently defines only a responsive minimum height and stretches with its flex row. Its child image uses `height: 100%`, so an unconstrained tall image can influence the row and card height even though `objectFit: 'cover'` is already present. Cropping needs a definite box in both dimensions.

## List Thumbnail Design

The thumbnail button becomes a fixed responsive square:

- Mobile: 72 by 72 pixels.
- Small desktop and wider: 96 by 96 pixels.
- The slot keeps `overflow: 'hidden'` and the image keeps `objectFit: 'cover'` with the default centered crop.
- The slot no longer stretches to the row height; it aligns to the start of the card content.
- The no-image site-letter fallback uses the same fixed square so rows remain aligned regardless of thumbnail availability.

Post text remains responsible for card height. A long title may still make a card taller, but the thumbnail itself cannot enlarge the card.

## Full Image Behavior

The existing click interaction and image dialog are unchanged. The dialog continues to use `objectFit: 'contain'` and its viewport-bounded maximum height, allowing the user to inspect the complete image.

## Accessibility And Interaction

The thumbnail remains a button with its existing accessible label and zoom cursor. Error fallback behavior, event propagation, read state, comments, likes, and post selection remain unchanged.

## Verification

A source-level board UI contract will require the responsive fixed height, the `cover` crop, and non-stretch alignment for the list slot. It will also protect the dialog's `contain` behavior. TypeScript, ESLint, the board and Top 10 UI contracts, formatter checks for changed files, and the production build will run after implementation.

## Out Of Scope

- Changing thumbnail URLs or backend image processing.
- Choosing a custom crop focal point per image.
- Changing the full-image dialog.
- Clamping post titles or summaries.
