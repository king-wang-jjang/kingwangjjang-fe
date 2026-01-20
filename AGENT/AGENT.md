# Frontend Agent — Shorts Comment UI (Mobile + PC)

## Goal
You are a frontend agent implementing a **YouTube Shorts-like comment UI** for a vertical video viewer.
There are **two versions**:
- **Mobile** (primary UX: bottom sheet)
- **PC** (primary UX: right-side panel or modal)

**Do NOT implement comment pinning (고정) feature.**

Deliver a clean, production-ready UI with accessible interactions and responsive behavior.

---

## Product Requirements

### Core UX (Shorts style)
- The main content is a **vertical video**.
- Comments open as an overlay:
  - **Mobile:** a **bottom sheet** that slides up and can be dismissed.
  - **PC:** a **right-side panel** (preferred) or a modal drawer; must not obstruct the entire video unless explicitly triggered.
- Comments are scrollable, video remains visible behind/next to the comments depending on viewport.

### Supported Comment Features
- View comment list (infinite scroll or "load more" supported)
- Add a comment (text input + submit)
- Like/unlike a comment
- Reply (1-level or 2-level nesting is fine; keep it simple)
- Sort (optional but recommended): "Top" / "Newest"
- Report / Delete actions (UI only; hook-ready)
- Empty state, loading state, error state

### Explicitly Excluded
- No pinned comment
- No creator “pinned badge”
- No “highlight pinned” behavior

---

## Layout Requirements

### Mobile Layout
- Default: video is full-screen vertical.
- Comment button opens bottom sheet:
  - Sheet header: title "댓글" + comment count + close (X)
  - Body: comment list (scroll area)
  - Footer: input field + send button
- Interactions:
  - Drag handle at top of sheet (optional but nice)
  - Dismiss via:
    - X button
    - swipe down (if feasible)
    - tapping dimmed backdrop
- Keyboard behavior:
  - When input focused, ensure footer stays visible and list scroll adjusts.

### PC Layout
- Use responsive breakpoints:
  - `>= 1024px`: show comments as **right panel** next to video
  - `768px ~ 1023px`: can still use right panel but narrower, or a drawer
  - `< 768px`: treat as mobile bottom sheet
- Right panel requirements:
  - Fixed width (e.g., 360–420px) with internal scroll
  - Header: title + count + close (if collapsible)
  - Footer: input + send
  - Should not shift layout jarringly when opening/closing (animate width or overlay).

---

## Data Contract (Frontend-facing Types)

Use these types (or equivalent) to keep implementation consistent:

```ts
export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  isVerified?: boolean;
};

export type Comment = {
  id: string;
  user: User;
  text: string;
  createdAt: string; // ISO
  likeCount: number;
  isLikedByMe: boolean;
  replyCount?: number;
  parentId?: string | null; // null for root
};

export type CommentSort = "top" | "newest";
