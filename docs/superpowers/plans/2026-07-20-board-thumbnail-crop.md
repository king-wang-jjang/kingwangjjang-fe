# Board Thumbnail Crop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Prevent tall list thumbnails from increasing realtime-board card height by cropping them inside fixed responsive squares.

**Architecture:** BoardPostCard keeps its existing thumbnail URL, failure fallback, click handler, and full-image dialog. Only the list-side image and fallback slots gain definite responsive heights and start alignment, allowing the existing objectFit cover image to crop predictably. The board source-contract verifier protects both fixed slots and the unchanged contain dialog.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, MUI 9, Node source-contract verification, ESLint, Prettier.

---

## File Map

- Modify: scripts/verify-board-ui.mjs — verifies fixed square list slots, cover cropping, non-stretch alignment, and contain behavior in the full-image dialog.
- Modify: src/sections/board/view/board-view.tsx:632-687 — constrains the image and fallback slots without changing image data or interactions.

### Task 1: Fixed list thumbnail crop

**Files:**
- Modify: scripts/verify-board-ui.mjs
- Modify: src/sections/board/view/board-view.tsx

- [ ] **Step 1: Add the failing thumbnail layout contract**

Insert this block after the existing feed-header filter assertions in scripts/verify-board-ui.mjs:

    const sideImageSlotStart = boardView.indexOf('const renderSideImageSlot');
    const postCardReturnStart = boardView.indexOf('  return (', sideImageSlotStart);

    assert.notEqual(
      sideImageSlotStart,
      -1,
      'board post card should define the side image slot'
    );
    assert.notEqual(
      postCardReturnStart,
      -1,
      'board post card should render after defining the side image slot'
    );

    const sideImageSlotSource = boardView.slice(sideImageSlotStart, postCardReturnStart);

    assert.equal(
      (sideImageSlotSource.match(/height: \{ xs: 72, sm: 96 \}/g) ?? []).length,
      2,
      'image and fallback slots should use fixed responsive square heights'
    );
    assert.equal(
      (sideImageSlotSource.match(/alignSelf: 'flex-start'/g) ?? []).length,
      2,
      'image and fallback slots should not stretch with card content'
    );
    assert.doesNotMatch(
      sideImageSlotSource,
      /minHeight: \{ xs: 72, sm: 96 \}|alignSelf: 'stretch'/,
      'side image slots should not use stretchable minimum heights'
    );
    assert.match(
      sideImageSlotSource,
      /objectFit: 'cover'/,
      'list thumbnail should crop inside its fixed slot'
    );
    assert.match(
      boardView,
      /open=\{imageOpen\}[\s\S]*maxHeight: '86vh'[\s\S]*objectFit: 'contain'/,
      'full-image dialog should continue to show the complete image'
    );

- [ ] **Step 2: Run the contract and verify the intended failure**

Run:

    node scripts/verify-board-ui.mjs

Expected: FAIL with image and fallback slots should use fixed responsive square heights and an actual count of 0.

- [ ] **Step 3: Give both list slots definite responsive squares**

In the image-button slot, change:

    width: { xs: 72, sm: 96 },
    minHeight: { xs: 72, sm: 96 },

to:

    width: { xs: 72, sm: 96 },
    height: { xs: 72, sm: 96 },

and change:

    alignSelf: 'stretch',

to:

    alignSelf: 'flex-start',

Make the same two replacements in the no-image fallback slot. Keep the child image unchanged:

    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',

- [ ] **Step 4: Format the modified files**

Run:

    yarn prettier --write scripts/verify-board-ui.mjs src/sections/board/view/board-view.tsx

Expected: Prettier exits 0 and reports both files.

- [ ] **Step 5: Verify the focused behavior**

Run:

    node scripts/verify-board-ui.mjs
    node scripts/verify-top10-ui.mjs
    yarn ts
    yarn eslint src/sections/board/view/board-view.tsx
    git diff --check

Expected: both source-contract verifiers print their passed messages, TypeScript and ESLint exit 0, and git reports no whitespace errors.

- [ ] **Step 6: Commit the functional slice**

Run:

    git add scripts/verify-board-ui.mjs src/sections/board/view/board-view.tsx
    git commit -m "fix: crop board list thumbnails"

### Task 2: Repository verification

**Files:**
- Verify only; no application changes expected.

- [ ] **Step 1: Run the full repository checks**

Run:

    yarn run check
    node scripts/verify-board-ui.mjs
    yarn build
    git diff --check

Expected: TypeScript, ESLint, authentication, Top 10, and board contracts pass; the production build completes with /board and /top10; and git reports no whitespace errors.

- [ ] **Step 2: Confirm the final branch state**

Run:

    git status --short
    git log --oneline -3

Expected: git status is clean and the recent log includes fix: crop board list thumbnails after the design and plan commits.
