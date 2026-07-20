# Board Header Filter Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Move all site-filter controls into a permanent second row of the realtime-board header while leaving only the floating Top 10 card in the desktop left sidebar.

**Architecture:** BoardView keeps the existing selectedSites state, menu, labels, toggle handler, and query behavior. Only its render composition changes: renderFeedHeader owns one responsive filter row, renderToolPane renders only Top10List, and the former standalone responsive filter card is removed. The existing source-contract verifier protects the single-render location and prevents the removed Workspace / Sites card from returning.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, MUI 9, Node source-contract verification, ESLint, Prettier.

---

## File Map

- Modify: scripts/verify-top10-ui.mjs — verifies that filters occur once inside the feed header and that the desktop tool pane contains only Top 10.
- Modify: src/sections/board/view/board-view.tsx:305-471, 589-592 — removes duplicate filter presentations and adds the responsive header filter row.

### Task 1: Add the failing header-filter contract

**Files:**
- Modify: scripts/verify-top10-ui.mjs

- [ ] **Step 1: Add section-level source assertions**

Insert the following block after the existing content-first Top 10 assertion:

    const feedHeaderStart = boardView.indexOf('const renderFeedHeader');
    const toolPaneStart = boardView.indexOf('const renderToolPane');
    const commentPaneStart = boardView.indexOf('const renderCommentEmptyState');

    assert.notEqual(feedHeaderStart, -1, 'board view should define the feed header');
    assert.notEqual(toolPaneStart, -1, 'board view should define the desktop tool pane');
    assert.notEqual(commentPaneStart, -1, 'board view should define the comment empty state');

    const feedHeaderSource = boardView.slice(feedHeaderStart, toolPaneStart);
    const toolPaneSource = boardView.slice(toolPaneStart, commentPaneStart);

    assert.equal(
      boardView.includes('const renderFilters'),
      false,
      'standalone responsive filter card should be removed'
    );
    assert.match(
      feedHeaderSource,
      /className="filter-icon-button"[\s\S]*selectedSites\.map[\s\S]*필터 초기화/,
      'feed header second row should own the filter button, chips, and reset action'
    );
    assert.doesNotMatch(
      toolPaneSource,
      /Workspace|Sites|FilterListIcon|selectedSites/,
      'desktop tool pane should not contain the former Workspace and Sites filters'
    );
    assert.match(
      toolPaneSource,
      /<Top10List variant="sidebar" \/>/,
      'desktop tool pane should retain the Top 10 sidebar'
    );
    assert.doesNotMatch(
      boardView,
      /isContentFirstLayout && renderFilters/,
      'content-first layouts should not render a separate filter card'
    );

- [ ] **Step 2: Run the focused verifier and confirm failure**

Run:

    node scripts/verify-top10-ui.mjs

Expected: FAIL with standalone responsive filter card should be removed.

### Task 2: Consolidate filters into the feed header

**Files:**
- Modify: src/sections/board/view/board-view.tsx

- [ ] **Step 1: Delete the standalone renderFilters constant**

Remove the complete block beginning with:

    const renderFilters = (

and ending immediately before:

    const renderFeedHeader = (

- [ ] **Step 2: Replace renderFeedHeader with the two-row composition**

Use this implementation:

    const renderFeedHeader = (
      <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
              }}
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

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
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
                      bgcolor: '#f4f4f4',
                      borderColor: '#bfc1b7',
                      color: '#F54E00',
                    },
                  }}
                >
                  <Badge color="secondary" variant="dot" invisible={!selectedSites.length}>
                    <FilterListIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {selectedSites.map((site) => (
                <Chip
                  key={site}
                  size="small"
                  label={siteLabels[site] ?? site}
                  onDelete={() => handleToggleSite(site)}
                  sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
                />
              ))}

              {!!selectedSites.length && (
                <Button color="inherit" size="small" onClick={() => setSelectedSites([])}>
                  필터 초기화
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );

- [ ] **Step 3: Reduce the desktop tool pane to Top 10**

Replace renderToolPane with:

    const renderToolPane = <Top10List variant="sidebar" />;

- [ ] **Step 4: Remove the responsive duplicate from the feed stack**

Change:

    {renderFeedHeader}
    {isContentFirstLayout && renderFilters}
    {renderPostList}

to:

    {renderFeedHeader}
    {renderPostList}

- [ ] **Step 5: Format the two modified source files**

Run:

    yarn prettier --write scripts/verify-top10-ui.mjs src/sections/board/view/board-view.tsx

Expected: Prettier exits 0 and reports both files.

- [ ] **Step 6: Run the focused verifier and static checks**

Run:

    node scripts/verify-top10-ui.mjs
    yarn ts
    yarn eslint src/sections/board/view/board-view.tsx
    git diff --check

Expected: the Top 10 contract prints Top 10 UI contract passed, TypeScript and ESLint exit 0, and git diff reports no whitespace errors.

- [ ] **Step 7: Commit the functional slice**

Run:

    git add scripts/verify-top10-ui.mjs src/sections/board/view/board-view.tsx
    git commit -m "feat: consolidate board filters into header"

### Task 3: Repository and responsive verification

**Files:**
- Verify only; no source changes expected.

- [ ] **Step 1: Run repository checks and the production build**

Run:

    yarn run check
    yarn build

Expected: TypeScript, ESLint, both source-contract verifiers, and the Next.js production build exit 0; the route list includes /board and /top10.

- [ ] **Step 2: Verify desktop behavior**

Start the feature worktree on port 8084, open /board at 1440 by 900 in the in-app browser, and select two sites.

Expected:

- The left sticky column contains 오늘의 TOP 10 and no Workspace / Sites card.
- The feed header shows title and description in its first row.
- Its second row shows one filter icon, both selected chips, and 필터 초기화.
- Removing a chip and using 필터 초기화 still update the board list.

- [ ] **Step 3: Verify mobile behavior**

Open /board at 390 by 844 and select at least one site.

Expected:

- The desktop Top 10 sidebar is hidden and the TOP 10 route action remains available.
- The same header card contains the filter row directly below the title area.
- Chips wrap within the card without horizontal clipping.
- No standalone filter card appears between the header and post list.

- [ ] **Step 4: Confirm final repository state**

Run:

    git status --short
    git log --oneline -3

Expected: git status is clean and the recent log contains the plan and functional commits for this consolidation.
