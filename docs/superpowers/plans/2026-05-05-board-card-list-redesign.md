# Board Card List Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the board post card as a quiet list item while preserving click-to-expand and comment selection behavior.

**Architecture:** Keep the implementation inside `BoardPostCard` in `src/sections/board/view/board-view.tsx`. Use the existing MUI primitives and the existing contract script as the lightweight regression harness.

**Tech Stack:** Next.js, React, MUI, existing `scripts/verify-board-ui.mjs` contract check.

---

### Task 1: Contract

**Files:**

- Modify: `scripts/verify-board-ui.mjs`

- [ ] **Step 1: Add card-specific assertions**

Add assertions for `quiet-list-card`, `expanded-summary-panel`, `expanded-card-close`, `expanded-card-actions`, and for the absence of `component="img"` inside collapsed card content.

- [ ] **Step 2: Run contract to verify it fails**

Run: `node scripts/verify-board-ui.mjs`

Expected: FAIL on the missing quiet list card marker.

### Task 2: Card Implementation

**Files:**

- Modify: `src/sections/board/view/board-view.tsx`

- [ ] **Step 1: Convert collapsed card**

Update `BoardPostCard` so the collapsed view is a compact list item with title, meta, small stats, optional small thumbnail marker, and a small chevron.

- [ ] **Step 2: Convert expanded panel**

Move the close `X` into the expanded content area and render summary plus small bottom actions.

- [ ] **Step 3: Preserve behavior**

Keep card click as `setExpanded(true); onPostSelect(post); markAsRead(boardId);` and keep close as the only collapse path.

### Task 3: Verification

**Files:**

- Verify: `scripts/verify-board-ui.mjs`
- Verify: `src/sections/board/view/board-view.tsx`

- [ ] **Step 1: Run contract**

Run: `node scripts/verify-board-ui.mjs`

Expected: PASS.

- [ ] **Step 2: Run static checks**

Run: `npm run ts`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Confirm browser**

Use `http://localhost:8083/board/` and verify collapsed cards look compact, first click expands, second click keeps expanded, and the close button sits inside the expanded area.
