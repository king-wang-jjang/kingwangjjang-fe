'use client';

import { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useAuthStore } from 'src/store/auth-store';
import { resolveApiBaseUrl } from 'src/api/api-base-url';
import {
  useInterestStore,
  getGuestInterests,
  LOGIN_INTEREST_KEY,
  NUDGE_DISMISSED_KEY,
} from 'src/store/interest-store';

import {
  DAY_MS,
  tagKey,
  readLocal,
  writeLocal,
  emptyProfile,
  getInterestScores,
} from './interests';

type Props = {
  personalized: boolean;
  onModeChange: (personalized: boolean) => void;
  onRefresh: () => void;
  tags: string[];
};

export function startInterestLogin() {
  const guest = getGuestInterests();
  const returnUrl = new URL(window.location.href);
  returnUrl.searchParams.set('feed', 'for-you');
  const returnTo = `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`;
  writeLocal(LOGIN_INTEREST_KEY, { guestId: guest.id, returnTo, at: Date.now() });
  try {
    sessionStorage.setItem(
      'interest-login-return',
      JSON.stringify({ path: returnTo, at: Date.now() })
    );
  } catch {
    /* Login still works without persistence. */
  }
  window.location.href = `${resolveApiBaseUrl()}/login`;
}

export function RecommendationControls({ personalized, onModeChange, onRefresh, tags }: Props) {
  const {
    profile: storedProfile,
    owner: storedOwner,
    ready: storedReady,
    change,
    syncStatus,
    sync,
  } = useInterestStore();
  const { authStatus, user } = useAuthStore();
  const expectedOwner =
    authStatus === 'checking'
      ? null
      : authStatus === 'authenticated' && user
        ? JSON.stringify([user.authProvider, user.userId])
        : 'guest';
  const owner = storedOwner === expectedOwner ? storedOwner : null;
  const ready = storedReady && owner !== null;
  const profile = useMemo(() => (owner ? storedProfile : emptyProfile()), [owner, storedProfile]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tag, setTag] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const learned = useMemo(
    () =>
      Array.from(getInterestScores(profile))
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key),
    [profile]
  );
  const suggestions = Array.from(new Set([...learned, ...tags.map(tagKey)]))
    .filter(
      (key) => key && !profile.followedTags.includes(key) && !profile.hiddenTags.includes(key)
    )
    .slice(0, 10);
  const guest = ready && owner !== 'guest' ? getGuestInterests() : null;
  const canImport =
    guest &&
    (guest.profile.events.length > 0 ||
      guest.profile.followedTags.length > 0 ||
      guest.profile.hiddenTags.length > 0);

  useEffect(() => {
    if (!personalized || owner !== 'guest' || !ready || !profile.enabled || dismissed || showNudge)
      return;
    const readCount = new Set(
      profile.events
        .filter((event) => ['open', 'source'].includes(event.kind))
        .map((event) => event.boardId)
    ).size;
    if (readCount < 5 || Number(readLocal(NUDGE_DISMISSED_KEY)) > Date.now()) return;
    try {
      if (sessionStorage.getItem('interest-login-shown')) return;
      sessionStorage.setItem('interest-login-shown', '1');
    } catch {
      /* Component state still limits the current visit. */
    }
    setShowNudge(true);
  }, [personalized, owner, ready, profile, dismissed, showNudge]);

  const dismissNudge = () => {
    writeLocal(NUDGE_DISMISSED_KEY, Date.now() + 30 * DAY_MS);
    setDismissed(true);
    setShowNudge(false);
  };
  const updateTag = (kind: 'follow' | 'unfollow' | 'hide' | 'unhide', value: string) => {
    change(kind, value);
    // Explicit preference changes take effect on the next requested snapshot.
    onRefresh();
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" useFlexGap sx={{ gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box role="group" aria-label="게시글 추천 방식">
          <Button
            size="small"
            color="inherit"
            aria-pressed={!personalized}
            variant={!personalized ? 'contained' : 'text'}
            onClick={() => onModeChange(false)}
          >
            전체
          </Button>
          <Button
            size="small"
            color="inherit"
            aria-pressed={personalized}
            variant={personalized ? 'contained' : 'text'}
            onClick={() => onModeChange(true)}
          >
            맞춤 추천
          </Button>
        </Box>
        <Button
          size="small"
          color="inherit"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((value) => !value)}
        >
          관심사 관리
        </Button>
        {personalized && (
          <Button size="small" color="inherit" onClick={onRefresh}>
            새 추천 보기
          </Button>
        )}
      </Stack>
      {personalized && (
        <Typography variant="caption" color="text.secondary">
          {profile.enabled
            ? learned.length
              ? '관심 태그와 새로운 분야의 글을 함께 추천합니다.'
              : '최근 인기글부터 보여드려요. 관심 태그를 선택하거나 글을 읽으면 추천에 반영됩니다.'
            : '개인화가 꺼져 있습니다. 최근 인기글을 보여드립니다.'}
        </Typography>
      )}
      {syncStatus === 'error' && (personalized || settingsOpen) && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                sync().catch(() => undefined);
              }}
            >
              다시 시도
            </Button>
          }
        >
          관심사를 동기화하지 못했습니다. 변경 사항은 이 기기에서 보관하고 다시 연결되면 저장합니다.
        </Alert>
      )}
      {personalized && showNudge && owner === 'guest' && !dismissed && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={0.5}
          sx={{ alignItems: { sm: 'center' }, p: 1, bgcolor: 'background.subtle', borderRadius: 1 }}
        >
          <Typography variant="caption" sx={{ flex: 1 }}>
            이 브라우저에서 쌓은 관심사를 다른 기기에서도 이어보세요.
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Button size="small" color="inherit" onClick={startInterestLogin}>
              로그인하고 저장
            </Button>
            <Button size="small" color="inherit" onClick={dismissNudge}>
              닫기
            </Button>
          </Stack>
        </Stack>
      )}
      {settingsOpen && (
        <Stack
          spacing={1.25}
          component="section"
          aria-label="관심사 관리"
          sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
            {owner === 'guest'
              ? '관심사는 이 브라우저에 저장됩니다.'
              : '관심사는 로그인한 계정에 저장됩니다.'}{' '}
            읽기 활동은 최근 30일만 반영합니다.
          </Typography>
          {canImport && (
            <Button
              size="small"
              color="inherit"
              disabled={syncStatus === 'saving'}
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => {
                writeLocal(LOGIN_INTEREST_KEY, {
                  guestId: guest.id,
                  owner,
                  at: Date.now(),
                  returnTo: '/board?feed=for-you',
                });
                useInterestStore.getState().importGuest();
                sync()
                  .then(onRefresh)
                  .catch(() => undefined);
              }}
            >
              이 브라우저의 비로그인 관심사 가져오기
            </Button>
          )}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={profile.enabled}
                disabled={!ready}
                onChange={(_, checked) => {
                  change(checked ? 'enable' : 'disable');
                  onRefresh();
                }}
              />
            }
            label="개인화 사용"
          />
          <Stack
            component="form"
            direction="row"
            spacing={1}
            onSubmit={(event) => {
              event.preventDefault();
              if (tagKey(tag)) {
                updateTag('follow', tag);
                setTag('');
              }
            }}
          >
            <TextField
              label="관심 태그"
              placeholder="예: 게임"
              size="small"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 }, inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
            <Button
              type="submit"
              color="inherit"
              disabled={!ready || !tagKey(tag) || profile.followedTags.length >= 100}
            >
              추가
            </Button>
            <Button
              color="inherit"
              disabled={!ready || !tagKey(tag) || profile.hiddenTags.length >= 100}
              onClick={() => {
                updateTag('hide', tag);
                setTag('');
              }}
            >
              숨기기
            </Button>
          </Stack>
          <Typography variant="caption">관심 태그</Typography>
          <Stack direction="row" useFlexGap sx={{ gap: 0.75, flexWrap: 'wrap' }}>
            {profile.followedTags.map((key) => (
              <Chip
                key={key}
                size="small"
                label={`#${key}`}
                onDelete={() => updateTag('unfollow', key)}
              />
            ))}
            {!profile.followedTags.length && (
              <Typography variant="caption" color="text.secondary">
                직접 선택한 태그가 없습니다.
              </Typography>
            )}
          </Stack>
          {!!suggestions.length && (
            <Stack
              direction="row"
              useFlexGap
              sx={{ gap: 0.5, flexWrap: 'wrap' }}
              aria-label="추가할 관심 태그"
            >
              {suggestions.map((key) => (
                <Button
                  key={key}
                  size="small"
                  color="inherit"
                  disabled={!ready || profile.followedTags.length >= 100}
                  onClick={() => updateTag('follow', key)}
                >
                  + #{key}
                </Button>
              ))}
            </Stack>
          )}
          {!!profile.hiddenTags.length && (
            <>
              <Typography variant="caption">
                숨긴 태그 · 삭제하면 다시 추천에 포함됩니다.
              </Typography>
              <Stack direction="row" useFlexGap sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                {profile.hiddenTags.map((key) => (
                  <Chip
                    key={key}
                    size="small"
                    variant="outlined"
                    label={`#${key}`}
                    onDelete={() => updateTag('unhide', key)}
                  />
                ))}
              </Stack>
            </>
          )}
          {resetConfirm ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="caption">관심 태그와 추천 기록을 모두 지울까요?</Typography>
              <Button
                size="small"
                color="error"
                onClick={() => {
                  change('reset');
                  setResetConfirm(false);
                  onRefresh();
                }}
              >
                모두 초기화
              </Button>
              <Button size="small" color="inherit" onClick={() => setResetConfirm(false)}>
                취소
              </Button>
            </Stack>
          ) : (
            <Button
              size="small"
              color="inherit"
              disabled={!ready}
              onClick={() => setResetConfirm(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              추천 기록 초기화
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
