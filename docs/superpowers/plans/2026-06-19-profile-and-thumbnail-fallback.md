# Profile and Thumbnail Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editable local display names, useful account/history profile surfaces, and metadata-based thumbnail fallback for crawled posts.

**Architecture:** User service owns the persisted `display_name` field and exposes it through `/api/users/me`. Frontend account UI consumes that field, stores local read timestamps in the existing read store, and resolves absolute thumbnail URLs without image-server prefixing. CrawlScheduler extracts metadata image URLs during post-page parsing and lets database insertion use them only when body images do not produce a local thumbnail.

**Tech Stack:** FastAPI, SQLAlchemy, pytest, Next.js App Router, TypeScript, MUI, Zustand, Node contract verification scripts.

---

### Task 1: User-Service Profile API

**Files:**
- Modify: `kingwangjjang-be/user-service/app/db/models.py`
- Modify: `kingwangjjang-be/user-service/app/repositories/users.py`
- Modify: `kingwangjjang-be/user-service/app/routes/users.py`
- Test: `kingwangjjang-be/user-service/tests/test_rest_users.py`

- [ ] **Step 1: Write failing API tests**

Add tests for `displayName` in `GET /me`, `PATCH /me`, invalid overlong names, and anonymous rejection.

- [ ] **Step 2: Verify red**

Run: `poetry run pytest tests/test_rest_users.py`

Expected: fails because `PATCH /api/users/me` and `displayName` do not exist.

- [ ] **Step 3: Implement minimal backend**

Add nullable `display_name`, schema compatibility for existing Postgres databases, repository update method, and authenticated route validation.

- [ ] **Step 4: Verify green**

Run: `poetry run pytest tests/test_rest_users.py`

Expected: all tests pass.

### Task 2: Frontend Profile UI And Read History

**Files:**
- Modify: `kingwangjjang-fe/src/auth/types.ts`
- Modify: `kingwangjjang-fe/src/api/user-api.ts`
- Modify: `kingwangjjang-fe/src/store/auth-store.ts`
- Modify: `kingwangjjang-fe/src/store/read-store.ts`
- Modify: `kingwangjjang-fe/src/layouts/app-shell.tsx`
- Modify: `kingwangjjang-fe/src/components/comment/comment-form.tsx`
- Modify: `kingwangjjang-fe/src/app/account/settings/page.tsx`
- Modify: `kingwangjjang-fe/src/app/account/history/page.tsx`
- Test: `kingwangjjang-fe/scripts/verify-auth-profile-ui.mjs`

- [ ] **Step 1: Write failing frontend contract checks**

Extend `verify-auth-profile-ui.mjs` to assert `updateMeProfile`, `displayName`, timestamped read history, settings form, and recent-read history UI.

- [ ] **Step 2: Verify red**

Run: `node scripts/verify-auth-profile-ui.mjs`

Expected: fails because those symbols and UI contracts are missing.

- [ ] **Step 3: Implement minimal frontend**

Add profile update API, local auth-store user updates, shared display-name preference, settings form, read stats, timestamped read history, and clear history action.

- [ ] **Step 4: Verify green**

Run: `yarn ts && yarn lint && node scripts/verify-auth-profile-ui.mjs`

Expected: TypeScript, ESLint, and contract checks pass.

### Task 3: Crawler Metadata Thumbnail Fallback

**Files:**
- Modify: `CrawlScheduler/crawl_scheduler/crawled_content.py`
- Modify: `CrawlScheduler/crawl_scheduler/db/postgres_controller.py`
- Modify: `CrawlScheduler/crawl_scheduler/community_website/community_website.py`
- Modify: `CrawlScheduler/crawl_scheduler/community_website/dcinside.py`
- Modify: `CrawlScheduler/crawl_scheduler/community_website/theqoo.py`
- Modify: `CrawlScheduler/crawl_scheduler/community_website/ppomppu.py`
- Modify: `CrawlScheduler/crawl_scheduler/community_website/ygosu.py`
- Test: `CrawlScheduler/tests/test_crawled_content.py`
- Test: `CrawlScheduler/tests/test_ocr_free_crawler.py`
- Test: `CrawlScheduler/tests/test_postgres_controller.py`

- [ ] **Step 1: Write failing crawler tests**

Add tests for metadata image extraction, metadata thumbnail fallback, and local image precedence.

- [ ] **Step 2: Verify red**

Run: `poetry run pytest tests/test_crawled_content.py tests/test_ocr_free_crawler.py tests/test_postgres_controller.py`

Expected: fails because metadata thumbnails are not extracted or selected.

- [ ] **Step 3: Implement minimal crawler fallback**

Add `metadata_image_url`, `thumbnail_from_contents`, shared metadata extraction, pass metadata block from crawlers, and keep local image precedence.

- [ ] **Step 4: Verify green**

Run: `poetry run pytest tests/test_crawled_content.py tests/test_ocr_free_crawler.py tests/test_postgres_controller.py`

Expected: all selected crawler tests pass.

### Task 4: Frontend Thumbnail URL Resolution

**Files:**
- Modify: `kingwangjjang-fe/src/sections/board/view/board-view.tsx`
- Test: `kingwangjjang-fe/scripts/verify-board-ui.mjs`

- [ ] **Step 1: Write failing contract check**

Assert that absolute thumbnails are used directly and relative thumbnails still use `CONFIG.imageServerUrl`.

- [ ] **Step 2: Verify red**

Run: `node scripts/verify-board-ui.mjs`

Expected: fails because thumbnail resolution is inline prefix-only logic.

- [ ] **Step 3: Implement resolver**

Add `resolveThumbnailSrc` and use it for card thumbnail and dialog image.

- [ ] **Step 4: Verify green**

Run: `yarn ts && yarn lint && node scripts/verify-board-ui.mjs`

Expected: TypeScript, ESLint, and contract checks pass.

### Task 5: Final Verification And Git

**Files:**
- Review all changed files with `git diff`.

- [ ] **Step 1: Run backend verification**

Run in `kingwangjjang-be/user-service`: `poetry run pytest tests/test_rest_users.py`

- [ ] **Step 2: Run crawler verification**

Run in `CrawlScheduler`: `poetry run pytest tests/test_crawled_content.py tests/test_ocr_free_crawler.py tests/test_postgres_controller.py`

- [ ] **Step 3: Run frontend verification**

Run in `kingwangjjang-fe`: `yarn ts && yarn lint && node scripts/verify-auth-profile-ui.mjs && node scripts/verify-board-ui.mjs`

- [ ] **Step 4: Commit and push each touched repository**

Commit `kingwangjjang-be`, `CrawlScheduler`, and `kingwangjjang-fe` separately, then push their current branches.
