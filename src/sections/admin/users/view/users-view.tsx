'use client';

import type { AdminUser, AdminUserFilters } from 'src/api/admin-user-api';

import { useState } from 'react';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Avatar,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Pagination,
  CircularProgress,
} from '@mui/material';

import { useAdminUsers } from 'src/hooks/use-admin-users';

import { useAuthStore } from 'src/store/auth-store';

import { UserDetailDialog } from './user-detail-dialog';
import { memberDate, memberName, memberError } from './user-utils';

const INITIAL_FILTERS: AdminUserFilters = { q: '', role: '', page: 1, pageSize: 20 };
const ROW_COLUMNS = {
  xs: 'minmax(0, 1fr) auto',
  md: 'minmax(180px, 2fr) minmax(120px, 1fr) 110px 170px 90px',
};

export function UsersView() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const users = useAdminUsers(filters);
  const currentUserId = useAuthStore((state) => state.user?.Id);
  const hasFilters = Boolean(filters.q || filters.role);

  const resetFilters = () => {
    setSearch('');
    setFilters(INITIAL_FILTERS);
  };

  return (
    <Box sx={{ width: 'min(100%, 1280px)', mx: 'auto', pb: 6 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <Box>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <PeopleOutlineRoundedIcon color="action" />
              <Typography variant="h4" component="h1">
                회원 관리
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              가입한 회원을 찾고 프로필과 표시 이름을 관리합니다.
            </Typography>
          </Box>
          <Button
            color="inherit"
            startIcon={<RefreshRoundedIcon />}
            disabled={users.isFetching}
            onClick={() => users.refetch()}
            sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}
          >
            새로고침
          </Button>
        </Stack>

        {message && (
          <Alert severity="success" onClose={() => setMessage(null)}>
            {message}
          </Alert>
        )}

        <Card variant="outlined">
          <Stack spacing={2} sx={{ p: { xs: 2, md: 2.5 } }}>
            <Box
              component="form"
              role="search"
              onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                setFilters((previous) => ({ ...previous, q: search.trim(), page: 1 }));
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="회원 검색"
                  placeholder="표시 이름, 닉네임 또는 회원 ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SearchRoundedIcon />}
                  sx={{ minWidth: 100 }}
                >
                  검색
                </Button>
              </Stack>
            </Box>
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <TextField
                select
                size="small"
                label="권한"
                value={filters.role || 'all'}
                sx={{ minWidth: 140 }}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    role:
                      event.target.value === 'all'
                        ? ''
                        : (event.target.value as AdminUserFilters['role']),
                    page: 1,
                  }))
                }
              >
                <MenuItem value="all">전체 권한</MenuItem>
                <MenuItem value="user">일반 회원</MenuItem>
                <MenuItem value="admin">관리자</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="표시 개수"
                value={filters.pageSize}
                sx={{ minWidth: 120 }}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    pageSize: Number(event.target.value),
                    page: 1,
                  }))
                }
              >
                {[20, 50, 100].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}명씩
                  </MenuItem>
                ))}
              </TextField>
              {(hasFilters || search) && (
                <Button color="inherit" onClick={resetFilters}>
                  초기화
                </Button>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
                최근 가입순 · 가입일은 한국 시간 기준
              </Typography>
            </Stack>
          </Stack>
          <Divider />
          <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
            <Typography variant="subtitle2" role="status" aria-live="polite">
              {users.isPending
                ? '회원 목록을 불러오는 중'
                : users.isError
                  ? '회원 목록 조회 실패'
                  : `${hasFilters ? '검색 결과' : '전체 회원'} ${users.data?.total.toLocaleString('ko-KR') ?? 0}명`}
            </Typography>
            {filters.q && (
              <Typography variant="caption" color="text.secondary">
                검색어: {filters.q}
              </Typography>
            )}
          </Box>

          {users.isPending ? (
            <Stack spacing={2} sx={{ py: 8, alignItems: 'center' }}>
              <CircularProgress size={30} aria-label="회원 목록 불러오는 중" />
            </Stack>
          ) : users.isError ? (
            <Alert
              severity="error"
              sx={{ mx: 2, mb: 2 }}
              action={
                <Button color="inherit" onClick={() => users.refetch()}>
                  다시 시도
                </Button>
              }
            >
              {memberError(users.error)}
            </Alert>
          ) : !users.data?.items.length ? (
            <Stack spacing={1.5} sx={{ py: 7, px: 2, alignItems: 'center', textAlign: 'center' }}>
              <PeopleOutlineRoundedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              <Typography variant="subtitle1">
                {hasFilters
                  ? '검색 조건에 맞는 회원이 없습니다.'
                  : filters.page > 1
                    ? '이 페이지에 회원이 없습니다.'
                    : '아직 가입한 회원이 없습니다.'}
              </Typography>
              {hasFilters ? (
                <Button onClick={resetFilters}>전체 회원 보기</Button>
              ) : filters.page > 1 ? (
                <Button onClick={() => setFilters((previous) => ({ ...previous, page: 1 }))}>
                  첫 페이지로
                </Button>
              ) : null}
            </Stack>
          ) : (
            <>
              <Box
                aria-hidden
                sx={{
                  display: { xs: 'none', md: 'grid' },
                  gridTemplateColumns: ROW_COLUMNS,
                  gap: 2,
                  px: 2.5,
                  py: 1.25,
                  bgcolor: 'background.subtle',
                  borderBlock: 1,
                  borderColor: 'divider',
                }}
              >
                {['회원', '로그인 ID', '권한', '가입일', '관리'].map((label) => (
                  <Typography
                    key={label}
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700 }}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>
              <Box component="ul" aria-label="회원 목록" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {users.data.items.map((member) => (
                  <MemberRow
                    key={member.Id}
                    member={member}
                    isSelf={member.Id === currentUserId}
                    onSelect={() => setSelectedId(member.Id)}
                  />
                ))}
              </Box>
            </>
          )}
          {users.data && !users.isError && users.data.total > 0 && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                p: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {users.data.items.length
                  ? `${(filters.page - 1) * filters.pageSize + 1}–${(filters.page - 1) * filters.pageSize + users.data.items.length}`
                  : '0'}{' '}
                / {users.data.total.toLocaleString('ko-KR')}명
              </Typography>
              <Pagination
                count={Math.max(1, Math.ceil(users.data.total / filters.pageSize))}
                page={filters.page}
                size="small"
                siblingCount={0}
                onChange={(_, page) => setFilters((previous) => ({ ...previous, page }))}
                getItemAriaLabel={(type, page) =>
                  ({
                    previous: '이전 페이지',
                    next: '다음 페이지',
                    first: '첫 페이지',
                    last: '마지막 페이지',
                    page: `${page}페이지`,
                    'start-ellipsis': '이전 페이지 더 보기',
                    'end-ellipsis': '다음 페이지 더 보기',
                  })[type] || `${page}페이지`
                }
              />
            </Stack>
          )}
        </Card>
      </Stack>
      {selectedId && (
        <UserDetailDialog
          key={selectedId}
          memberId={selectedId}
          onClose={() => setSelectedId(null)}
          onSaved={(name) => {
            setSelectedId(null);
            setMessage(`${name} 회원의 표시 이름을 저장했습니다.`);
          }}
        />
      )}
    </Box>
  );
}

function MemberRow({
  member,
  isSelf,
  onSelect,
}: {
  member: AdminUser;
  isSelf: boolean;
  onSelect: () => void;
}) {
  const name = memberName(member);
  return (
    <Box
      component="li"
      sx={{
        display: 'grid',
        gridTemplateColumns: ROW_COLUMNS,
        gap: { xs: 1.5, md: 2 },
        alignItems: 'center',
        px: { xs: 2, md: 2.5 },
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
        '&:hover': { bgcolor: 'background.hover' },
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: 'center',
          minWidth: 0,
          gridColumn: { xs: '1 / -1', md: 'auto' },
          gridRow: { xs: '1', md: 'auto' },
        }}
      >
        <Avatar src={member.profileImage || undefined} alt={name} sx={{ width: 38, height: 38 }}>
          {name.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            title={name}
            sx={{
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {name} {isSelf && <Chip component="span" label="나" size="small" />}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {member.authProvider === 'kakao' ? '카카오' : member.authProvider}
          </Typography>
        </Box>
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflowWrap: 'anywhere',
          gridColumn: { xs: '1', md: 'auto' },
          gridRow: { xs: '2', md: 'auto' },
        }}
      >
        <Box component="span" sx={{ display: { md: 'none' } }}>
          로그인 ID ·{' '}
        </Box>
        {member.userId}
      </Typography>
      <Box
        sx={{
          gridColumn: { xs: '2', md: 'auto' },
          gridRow: { xs: '2', md: 'auto' },
          justifySelf: 'start',
        }}
      >
        <Chip
          size="small"
          variant="outlined"
          color={member.role === 'admin' ? 'primary' : 'default'}
          label={member.role === 'admin' ? '관리자' : '일반 회원'}
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ gridColumn: { xs: '1', md: 'auto' }, gridRow: { xs: '3', md: 'auto' } }}
      >
        {memberDate(member.createTime)}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        aria-label={`${name} 상세 보기`}
        onClick={onSelect}
        sx={{ gridColumn: { xs: '2', md: 'auto' }, gridRow: { xs: '3', md: 'auto' } }}
      >
        상세 보기
      </Button>
    </Box>
  );
}
