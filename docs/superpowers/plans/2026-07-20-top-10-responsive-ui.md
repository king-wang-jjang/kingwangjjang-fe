# Top 10 Responsive UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Show the existing daily Top 10 ranking in a sticky desktop left sidebar and on a dedicated mobile-friendly /top10 page.

**Architecture:** A focused React Query hook fetches getDailyBoards(0, 10), and one Top10List component renders every data state in sidebar and page variants. BoardView owns desktop placement and the content-first route action, while AppShell and the new App Router route provide mobile navigation without loading ranking data on unrelated pages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, MUI 9, TanStack React Query 5, Node source-contract verification, ESLint, Prettier.

---

## File Map

- Create: scripts/verify-top10-ui.mjs — incrementally verifies the data, shared component, desktop placement, route, and navigation contracts.
- Create: src/hooks/use-top-boards.ts — owns the cached ten-item daily ranking request.
- Create: src/components/top10/top10-list.tsx — renders semantic ranking rows and loading, error, and empty states.
- Create: src/components/top10/index.ts — exposes the shared ranking component.
- Modify: src/sections/board/view/board-view.tsx:1-50, 366-449, 553-557 — embeds the sticky desktop ranking and adds the responsive route action.
- Create: src/sections/top10/view/top10-view.tsx — provides the dedicated page heading and board return action.
- Create: src/app/top10/layout.tsx — wraps the route in AppShell.
- Create: src/app/top10/page.tsx — defines metadata and renders Top10View.
- Modify: src/layouts/app-shell.tsx:9-48 — adds TOP 10 to the mobile navigation drawer.
- Modify: package.json:7-23 — adds the Top 10 contract verifier to the repository check command.

### Task 1: Daily Top 10 query contract and hook

**Files:**
- Create: scripts/verify-top10-ui.mjs
- Create: src/hooks/use-top-boards.ts

- [ ] **Step 1: Write the failing data contract**

Create scripts/verify-top10-ui.mjs with:

    import fs from 'node:fs';
    import assert from 'node:assert/strict';

    function readRequired(path) {
      assert.equal(fs.existsSync(path), true, 'Missing required file: ' + path);
      return fs.readFileSync(path, 'utf8');
    }

    console.log('Verifying Top 10 UI contract...');

    const topBoardsHook = readRequired('src/hooks/use-top-boards.ts');

    assert.match(
      topBoardsHook,
      /TOP_BOARDS_LIMIT\s*=\s*10/,
      'Top 10 hook should cap the ranking at ten posts'
    );
    assert.match(
      topBoardsHook,
      /queryKey:\s*TOP_BOARDS_QUERY_KEY/,
      'Top 10 hook should use a stable query key'
    );
    assert.match(
      topBoardsHook,
      /getDailyBoards\(0,\s*TOP_BOARDS_LIMIT\)/,
      'Top 10 hook should request the first ten daily-ranked posts'
    );
    assert.match(
      topBoardsHook,
      /placeholderData:\s*\(previousData\)\s*=>\s*previousData/,
      'Top 10 hook should preserve successful data while refreshing'
    );

    console.log('Top 10 UI contract passed.');

- [ ] **Step 2: Run the contract and verify it fails**

Run:

    node scripts/verify-top10-ui.mjs

Expected: FAIL with Missing required file: src/hooks/use-top-boards.ts.

- [ ] **Step 3: Implement the minimal ranking hook**

Create src/hooks/use-top-boards.ts with:

    import { useQuery } from '@tanstack/react-query';

    import { getDailyBoards } from 'src/api/board-api';

    export const TOP_BOARDS_LIMIT = 10;
    export const TOP_BOARDS_QUERY_KEY = ['boards', 'daily', 'top10'] as const;

    export function useTopBoards() {
      return useQuery({
        queryKey: TOP_BOARDS_QUERY_KEY,
        queryFn: () => getDailyBoards(0, TOP_BOARDS_LIMIT),
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
      });
    }

- [ ] **Step 4: Run focused verification**

Run:

    node scripts/verify-top10-ui.mjs
    yarn ts
    yarn eslint src/hooks/use-top-boards.ts

Expected: the contract prints Top 10 UI contract passed, TypeScript reports no errors, and ESLint exits 0.

- [ ] **Step 5: Commit the data slice**

Run:

    git add scripts/verify-top10-ui.mjs src/hooks/use-top-boards.ts
    git commit -m "feat: add daily top 10 query"

### Task 2: Shared semantic Top 10 list

**Files:**
- Modify: scripts/verify-top10-ui.mjs
- Create: src/components/top10/top10-list.tsx
- Create: src/components/top10/index.ts

- [ ] **Step 1: Extend the contract before the final success log**

Insert this block before the final console.log in scripts/verify-top10-ui.mjs:

    const top10List = readRequired('src/components/top10/top10-list.tsx');
    const top10Index = readRequired('src/components/top10/index.ts');

    assert.match(
      top10List,
      /type Top10ListProps[\s\S]*variant\?: 'sidebar' \| 'page'/,
      'shared Top 10 list should expose sidebar and page variants'
    );
    assert.match(
      top10List,
      /component="ol"/,
      'ranking content should use ordered-list semantics'
    );
    assert.match(
      top10List,
      /posts\.slice\(0,\s*TOP_BOARDS_LIMIT\)/,
      'ranking UI should defensively render at most ten rows'
    );
    assert.match(top10List, /isPending/, 'ranking UI should render a loading state');
    assert.match(top10List, /isError/, 'ranking UI should render an error state');
    assert.match(top10List, /refetch/, 'ranking error state should expose retry');
    assert.match(top10List, /target="_blank"/, 'ranking links should open original posts');
    assert.match(
      top10List,
      /rel="noopener noreferrer"/,
      'external ranking links should isolate the opener'
    );
    assert.match(
      top10Index,
      /export \{ Top10List \} from '.\/top10-list'/,
      'Top 10 component should have a focused public export'
    );

- [ ] **Step 2: Run the extended contract and verify it fails**

Run:

    node scripts/verify-top10-ui.mjs

Expected: FAIL with Missing required file: src/components/top10/top10-list.tsx.

- [ ] **Step 3: Build the shared list component**

Create src/components/top10/top10-list.tsx with:

    'use client';

    import type { BoardPost } from 'src/api/board-api';

    import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
    import {
      Box,
      Card,
      Alert,
      Stack,
      Button,
      Divider,
      Skeleton,
      Typography,
      CardContent,
      CircularProgress,
    } from '@mui/material';

    import {
      useTopBoards,
      TOP_BOARDS_LIMIT,
    } from 'src/hooks/use-top-boards';

    type Top10ListProps = {
      variant?: 'sidebar' | 'page';
    };

    function postKey(post: BoardPost) {
      return post.Id || post.site + '-' + post.no;
    }

    function Top10Skeleton() {
      return (
        <Stack aria-label="Top 10을 불러오는 중" spacing={0}>
          {Array.from({ length: TOP_BOARDS_LIMIT }).map((_, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={1}
              sx={{
                minHeight: 54,
                px: 1.25,
                py: 1,
                alignItems: 'center',
                borderBottom: index === TOP_BOARDS_LIMIT - 1 ? 0 : 1,
                borderColor: '#d7d8d1',
              }}
            >
              <Skeleton variant="rounded" width={28} height={28} />
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Skeleton width={70} height={14} />
                <Skeleton width={index % 2 === 0 ? '88%' : '72%'} height={20} />
              </Stack>
            </Stack>
          ))}
        </Stack>
      );
    }

    function Top10Row({
      post,
      rank,
      variant,
    }: {
      post: BoardPost;
      rank: number;
      variant: 'sidebar' | 'page';
    }) {
      const emphasized = rank <= 3;

      return (
        <Box component="li">
          <Box
            component="a"
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            title={post.title}
            aria-label={[rank + '위', post.title, '원문 새 탭에서 열기'].join(' ')}
            sx={{
              minHeight: variant === 'page' ? 68 : 56,
              px: variant === 'page' ? 1.75 : 1.25,
              py: variant === 'page' ? 1.25 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              borderBottom: 1,
              borderColor: '#d7d8d1',
              color: '#4d4f46',
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': {
                bgcolor: '#f4f4f4',
                color: '#F54E00',
              },
              '&:focus-visible': {
                outline: '3px solid rgba(59, 130, 246, 0.45)',
                outlineOffset: -3,
              },
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: 30,
                height: 30,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                borderRadius: 1,
                bgcolor: emphasized ? '#23251d' : '#e5e7e0',
                color: emphasized ? '#fdfdf8' : '#4d4f46',
                fontSize: '0.82rem',
                fontWeight: 800,
              }}
            >
              {rank}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                component="span"
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#65675e',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {post.siteLabel}
              </Typography>
              <Typography
                component="span"
                variant="body2"
                sx={{
                  mt: 0.35,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  fontWeight: rank <= 3 ? 700 : 600,
                  lineHeight: 1.35,
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                }}
              >
                {post.title}
              </Typography>
            </Box>

            <OpenInNewRoundedIcon
              aria-hidden="true"
              sx={{ flexShrink: 0, color: '#9ea096', fontSize: 17 }}
            />
          </Box>
        </Box>
      );
    }

    export function Top10List({ variant = 'sidebar' }: Top10ListProps) {
      const {
        data: posts = [],
        isError,
        isPending,
        isFetching,
        refetch,
      } = useTopBoards();
      const heading = variant === 'page' ? '일간 인기 순위' : '오늘의 TOP 10';

      return (
        <Card
          component="section"
          aria-labelledby={'top10-' + variant + '-title'}
          sx={{ overflow: 'hidden', bgcolor: '#fdfdf8', borderColor: '#bfc1b7' }}
        >
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Stack
              direction="row"
              sx={{
                minHeight: 52,
                px: variant === 'page' ? 1.75 : 1.5,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                id={'top10-' + variant + '-title'}
                variant={variant === 'page' ? 'h6' : 'subtitle1'}
                sx={{ color: '#23251d', fontWeight: 800 }}
              >
                {heading}
              </Typography>
              {isFetching && !isPending && (
                <CircularProgress size={16} aria-label="Top 10 새로고침 중" />
              )}
            </Stack>
            <Divider />

            {isPending && <Top10Skeleton />}

            {isError && (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={() => void refetch()}>
                    다시 시도
                  </Button>
                }
                sx={{ m: 1.25 }}
              >
                인기 순위를 불러오지 못했습니다.
              </Alert>
            )}

            {!isPending && !isError && !posts.length && (
              <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  아직 집계된 인기 글이 없습니다.
                </Typography>
              </Box>
            )}

            {!isPending && !isError && !!posts.length && (
              <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {posts.slice(0, TOP_BOARDS_LIMIT).map((post, index) => (
                  <Top10Row
                    key={postKey(post)}
                    post={post}
                    rank={index + 1}
                    variant={variant}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      );
    }

Create src/components/top10/index.ts with:

    export { Top10List } from './top10-list';

- [ ] **Step 4: Verify the shared component**

Run:

    node scripts/verify-top10-ui.mjs
    yarn ts
    yarn eslint src/components/top10/top10-list.tsx src/components/top10/index.ts

Expected: all commands exit 0.

- [ ] **Step 5: Commit the shared UI**

Run:

    git add scripts/verify-top10-ui.mjs src/components/top10 src/hooks/use-top-boards.ts
    git commit -m "feat: add shared top 10 list"

### Task 3: Sticky desktop placement and content-first route action

**Files:**
- Modify: scripts/verify-top10-ui.mjs
- Modify: src/sections/board/view/board-view.tsx:1-50, 366-449, 553-557

- [ ] **Step 1: Add desktop and responsive assertions**

Insert this block before the final success log in scripts/verify-top10-ui.mjs:

    const boardView = readRequired('src/sections/board/view/board-view.tsx');

    assert.match(
      boardView,
      /<Top10List variant="sidebar" \/>/,
      'desktop workbench should render the shared Top 10 sidebar'
    );
    assert.match(
      boardView,
      /position: 'sticky'[\s\S]*maxHeight: 'calc\(100vh - 94px\)'[\s\S]*overflowY: 'auto'/,
      'desktop left column should float and remain usable on short viewports'
    );
    assert.match(
      boardView,
      /isContentFirstLayout &&[\s\S]*href="\/top10"[\s\S]*TOP 10/,
      'content-first layouts should link to the dedicated Top 10 page'
    );

- [ ] **Step 2: Run the contract and verify the new assertions fail**

Run:

    node scripts/verify-top10-ui.mjs

Expected: FAIL with desktop workbench should render the shared Top 10 sidebar.

- [ ] **Step 3: Add the required imports**

In src/sections/board/view/board-view.tsx, add these imports in their ESLint-sorted groups:

    import Link from 'next/link';

    import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

    import { Top10List } from 'src/components/top10';

- [ ] **Step 4: Replace the feed header**

Replace renderFeedHeader with:

    const renderFeedHeader = (
      <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5">실시간 게시판</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                수집된 게시글을 빠르게 훑고 댓글 흐름을 확인하세요.
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ alignItems: 'center' }}>
              {isContentFirstLayout && (
                <Button
                  component={Link}
                  href="/top10"
                  color="inherit"
                  variant="outlined"
                  size="small"
                  startIcon={<EmojiEventsOutlinedIcon />}
                  sx={{ bgcolor: '#fdfdf8', whiteSpace: 'nowrap' }}
                >
                  TOP 10
                </Button>
              )}
              <Chip
                label={postData.length + '개 게시글'}
                size="small"
                sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );

- [ ] **Step 5: Stack Top 10 above the existing filters**

Replace renderToolPane with:

    const renderToolPane = (
      <Stack spacing={1.25}>
        <Top10List variant="sidebar" />

        <Card sx={{ bgcolor: '#eeefe9', borderColor: '#bfc1b7', borderRadius: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="overline" sx={{ color: '#65675e', fontWeight: 800 }}>
              Workspace
            </Typography>

            <Stack spacing={1} sx={{ mt: 1.25 }}>
              <Typography variant="overline" sx={{ color: '#65675e', fontWeight: 800 }}>
                Sites
              </Typography>
              <Tooltip title="사이트 필터">
                <IconButton
                  className="filter-icon-button"
                  color="inherit"
                  onClick={(event) => setSiteMenuAnchor(event.currentTarget)}
                  aria-label="사이트 필터"
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#fdfdf8',
                    border: 1,
                    borderColor: '#bfc1b7',
                    color: '#4d4f46',
                    '&:hover': {
                      color: '#F54E00',
                      borderColor: '#bfc1b7',
                      bgcolor: '#f4f4f4',
                    },
                  }}
                >
                  <Badge color="secondary" variant="dot" invisible={!selectedSites.length}>
                    <FilterListIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {!!selectedSites.length && (
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {selectedSites.map((site) => (
                    <Chip
                      key={site}
                      size="small"
                      label={siteLabels[site] ?? site}
                      onDelete={() => handleToggleSite(site)}
                      sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
                    />
                  ))}
                </Stack>
              )}

              {!!selectedSites.length && (
                <Button color="inherit" size="small" onClick={() => setSelectedSites([])}>
                  필터 초기화
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );

- [ ] **Step 6: Bound the sticky left column to the viewport**

Replace the left-column Box sx prop with:

    sx={{
      display: isContentFirstLayout ? 'none' : 'block',
      position: 'sticky',
      top: 78,
      maxHeight: 'calc(100vh - 94px)',
      overflowY: 'auto',
      pr: 0.25,
      scrollbarWidth: 'thin',
    }}

- [ ] **Step 7: Verify desktop integration**

Run:

    node scripts/verify-top10-ui.mjs
    yarn ts
    yarn eslint src/sections/board/view/board-view.tsx

Expected: all commands exit 0.

- [ ] **Step 8: Commit desktop integration**

Run:

    git add scripts/verify-top10-ui.mjs src/sections/board/view/board-view.tsx
    git commit -m "feat: float top 10 beside board feed"

### Task 4: Dedicated Top 10 page and mobile navigation

**Files:**
- Modify: scripts/verify-top10-ui.mjs
- Modify: src/layouts/app-shell.tsx:9-48
- Create: src/sections/top10/view/top10-view.tsx
- Create: src/app/top10/layout.tsx
- Create: src/app/top10/page.tsx

- [ ] **Step 1: Add route and navigation assertions**

Insert this block before the final success log in scripts/verify-top10-ui.mjs:

    const appShell = readRequired('src/layouts/app-shell.tsx');
    const top10View = readRequired('src/sections/top10/view/top10-view.tsx');
    const top10Layout = readRequired('src/app/top10/layout.tsx');
    const top10Page = readRequired('src/app/top10/page.tsx');

    assert.match(
      appShell,
      /label: 'TOP 10'[\s\S]*href: '\/top10'[\s\S]*EmojiEventsOutlinedIcon/,
      'mobile drawer should expose the Top 10 route'
    );
    assert.match(
      top10View,
      /<Top10List variant="page" \/>/,
      'dedicated route should reuse the shared page variant'
    );
    assert.match(
      top10View,
      /href="\/board"[\s\S]*실시간 게시판/,
      'dedicated route should provide a clear return to the board'
    );
    assert.match(top10Layout, /<AppShell>/, 'Top 10 route should reuse the app shell');
    assert.match(top10Page, /<Top10View \/>/, 'Top 10 page should render its focused view');

- [ ] **Step 2: Run the contract and verify the route slice fails**

Run:

    node scripts/verify-top10-ui.mjs

Expected: FAIL with Missing required file: src/sections/top10/view/top10-view.tsx.

- [ ] **Step 3: Add TOP 10 to AppShell navigation**

Add this icon import to src/layouts/app-shell.tsx:

    import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

Replace navItems with:

    const navItems = [
      {
        label: '실시간 게시판',
        href: '/board',
        icon: <ArticleOutlinedIcon fontSize="small" />,
      },
      {
        label: 'TOP 10',
        href: '/top10',
        icon: <EmojiEventsOutlinedIcon fontSize="small" />,
      },
    ];

- [ ] **Step 4: Create the page view**

Create src/sections/top10/view/top10-view.tsx with:

    'use client';

    import Link from 'next/link';

    import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
    import { Box, Stack, Button, Typography } from '@mui/material';

    import { Top10List } from 'src/components/top10';

    export function Top10View() {
      return (
        <Box sx={{ width: 'min(100%, 760px)', mx: 'auto', py: { xs: 1, md: 2 } }}>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' }, justifyContent: 'space-between' }}
            >
              <Box>
                <Typography variant="h4">오늘의 TOP 10</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  하루 동안 가장 주목받은 커뮤니티 글을 순서대로 모았습니다.
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/board"
                color="inherit"
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, whiteSpace: 'nowrap' }}
              >
                실시간 게시판
              </Button>
            </Stack>

            <Top10List variant="page" />
          </Stack>
        </Box>
      );
    }

- [ ] **Step 5: Create the App Router files**

Create src/app/top10/layout.tsx with:

    import { AppShell } from 'src/layouts/app-shell';

    type Props = {
      children: React.ReactNode;
    };

    export default function Top10Layout({ children }: Props) {
      return <AppShell>{children}</AppShell>;
    }

Create src/app/top10/page.tsx with:

    import { CONFIG } from 'src/config-global';

    import { Top10View } from 'src/sections/top10/view/top10-view';

    export const metadata = { title: '오늘의 TOP 10 - ' + CONFIG.appName };

    export default function Page() {
      return <Top10View />;
    }

- [ ] **Step 6: Verify the mobile page slice**

Run:

    node scripts/verify-top10-ui.mjs
    yarn ts
    yarn eslint src/layouts/app-shell.tsx src/sections/top10/view/top10-view.tsx src/app/top10/layout.tsx src/app/top10/page.tsx

Expected: all commands exit 0.

- [ ] **Step 7: Commit the route slice**

Run:

    git add scripts/verify-top10-ui.mjs src/layouts/app-shell.tsx src/sections/top10 src/app/top10
    git commit -m "feat: add mobile top 10 page"

### Task 5: Repository verification and responsive browser QA

**Files:**
- Modify: scripts/verify-top10-ui.mjs
- Modify: package.json:22

- [ ] **Step 1: Require the contract from the repository check**

Insert this block before the final success log in scripts/verify-top10-ui.mjs:

    const packageJson = readRequired('package.json');

    assert.match(
      packageJson,
      /verify-auth-profile-ui\.mjs && node scripts\/verify-top10-ui\.mjs/,
      'repository check should run the Top 10 UI contract'
    );

- [ ] **Step 2: Run the verifier and confirm the package assertion fails**

Run:

    node scripts/verify-top10-ui.mjs

Expected: FAIL with repository check should run the Top 10 UI contract.

- [ ] **Step 3: Add the verifier to package.json**

Set the check script to:

    "check": "yarn ts && yarn lint && node scripts/verify-auth-profile-ui.mjs && node scripts/verify-top10-ui.mjs"

- [ ] **Step 4: Run all static and production checks**

Run:

    node scripts/verify-top10-ui.mjs
    yarn run check
    yarn fm:check
    yarn build
    git diff --check

Expected: both contract verifiers pass, TypeScript and ESLint exit 0, Prettier reports all matched files use its style, the production build completes, and git diff reports no whitespace errors.

- [ ] **Step 5: Commit the verification wiring**

Run:

    git add scripts/verify-top10-ui.mjs package.json
    git commit -m "test: verify responsive top 10 ui"

- [ ] **Step 6: Start an isolated development server**

From the feature worktree, start Next.js on port 8084 in a hidden background window:

    $top10Server = Start-Process -FilePath "cmd.exe" -ArgumentList "/d", "/s", "/c", "yarn next dev -p 8084" -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru

Wait until http://127.0.0.1:8084 responds. Keep the process id in $top10Server.Id for cleanup.

- [ ] **Step 7: Install a deterministic browser fixture**

Use the in-app browser control session and route every daily ranking request matching **/boardservice/api/boards/daily* with this response shape before navigation:

    const dailyPosts = Array.from({ length: 10 }, (_, index) => ({
      _id: 'top-' + (index + 1),
      category: 'community',
      no: index + 1,
      site: index % 2 === 0 ? 'dcinside' : 'ppomppu',
      title: (index + 1) + '위 인기 게시글 제목',
      url: 'https://example.com/post/' + (index + 1),
      create_time: '2026-07-20T00:00:00Z',
      daily_score: 100 - index,
    }));

    await page.route('**/boardservice/api/boards/daily*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dailyPosts),
      })
    );

Expected: the browser receives ten deterministic ranked posts without depending on the local backend.

- [ ] **Step 8: Verify the desktop layout**

Set the viewport to 1440 by 900, open http://127.0.0.1:8084/board, and inspect the rendered page.

Expected:

- The left 320-pixel workbench column shows 오늘의 TOP 10 above the site filter card.
- Ten rows render in API order, with ranks 1–3 using the dark emphasis.
- The left column remains sticky below the 58-pixel header and scrolls internally when needed.
- A ranking row has target="_blank" and rel="noopener noreferrer".
- The center feed and right comment column keep their existing desktop widths.

- [ ] **Step 9: Verify the mobile route**

Set the viewport to 390 by 844 and open http://127.0.0.1:8084/board.

Expected:

- The floating Top 10 sidebar is absent.
- The board header contains a TOP 10 action.
- Opening the hamburger drawer shows a TOP 10 navigation row.
- Both entries navigate to http://127.0.0.1:8084/top10.
- The page shows 오늘의 TOP 10, ten touch-friendly rows, and the 실시간 게시판 return action.
- Keyboard focus on a ranking row has a visible focus outline.

- [ ] **Step 10: Verify error and partial states**

Change the route fixture once to return status 503 and reload /top10.

Expected: 인기 순위를 불러오지 못했습니다 and 다시 시도 appear inside the ranking card.

Change the fixture to return only three posts and reload.

Expected: exactly three rows render with ranks 1, 2, and 3; no empty ranks are invented.

- [ ] **Step 11: Stop the development server and confirm repository state**

Run:

    Stop-Process -Id $top10Server.Id
    git status --short
    git log --oneline -5

Expected: the server stops, git status is clean, and the recent log contains the five focused commits from this plan.
