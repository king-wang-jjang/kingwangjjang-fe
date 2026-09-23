import type { InterestProfile } from 'src/personalization/interests';

import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@testing-library/react';
import { vi, test, expect, describe, beforeEach } from 'vitest';

import { getInterestProfile, updateInterestProfile } from 'src/api/recommendation-api';
import { useAuthStore } from 'src/store/auth-store';
import {
  useInterestStore,
  GUEST_INTEREST_KEY,
  LOGIN_INTEREST_KEY,
  NUDGE_DISMISSED_KEY,
} from 'src/store/interest-store';
import { RecommendationControls } from 'src/personalization/recommendation-controls';
import {
  DAY_MS,
  emptyProfile,
  normalizeProfile,
  getInterestScores,
  applyInterestMutation,
} from 'src/personalization/interests';

vi.mock('src/api/recommendation-api', () => ({
  getInterestProfile: vi.fn(),
  updateInterestProfile: vi.fn(),
}));

const now = Date.now();
const event = (boardId = 'game', age = 0) => ({
  id: `event:${boardId}`,
  kind: 'open' as const,
  boardId,
  tags: ['게임'],
  at: new Date(now - age).toISOString(),
});

let server: InterestProfile;
beforeEach(async () => {
  useAuthStore.getState().logout();
  await useInterestStore.getState().setOwner(null);
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem(
    GUEST_INTEREST_KEY,
    JSON.stringify({ id: 'guest-test', profile: emptyProfile() })
  );
  server = emptyProfile();
  vi.mocked(getInterestProfile)
    .mockReset()
    .mockImplementation(async () => server);
  vi.mocked(updateInterestProfile)
    .mockReset()
    .mockImplementation(async (mutations) => {
      server = mutations.reduce(
        (profile, mutation) => applyInterestMutation(profile, mutation),
        server
      );
      return server;
    });
});

describe('tag interests', () => {
  test('uses the strongest action per post/day, splits tags and normalizes aliases', () => {
    const profile = {
      ...emptyProfile(),
      events: [
        { ...event(), tags: [' #ＡＩ ', '게임'] },
        { ...event(), id: 'source', kind: 'source' as const, tags: ['ai', '게임'] },
        { ...event(), id: 'source-again', kind: 'source' as const, tags: ['AI', '게임'] },
      ],
    };
    expect(Object.fromEntries(getInterestScores(profile, now))).toEqual({ ai: 1.5, 게임: 1.5 });
  });

  test('decays implicit interests and expires old records while keeping followed tags', () => {
    const profile = {
      ...emptyProfile(),
      events: [event('old', 31 * DAY_MS), event('half', 14 * DAY_MS)],
      followedTags: ['AI'],
    };
    expect(normalizeProfile(profile, now).events).toHaveLength(1);
    expect(Object.fromEntries(getInterestScores(profile, now))).toEqual({ 게임: 1, ai: 10 });
  });

  test('bounds history and tolerates corrupted persisted values', () => {
    expect(normalizeProfile({ schemaVersion: 999, events: [] })).toEqual(emptyProfile());
    expect(
      normalizeProfile({
        schemaVersion: 1,
        events: [null, {}, { ...event(), at: 'invalid' }],
        followedTags: [null, 4, ' #AI '],
      }).followedTags
    ).toEqual(['ai']);
    const profile = normalizeProfile({
      ...emptyProfile(),
      events: Array.from({ length: 550 }, (_, index) => event(String(index))),
    });
    expect(profile.events).toHaveLength(500);
  });

  test('deduplicates guest clicks, persists them and never calls profile API', async () => {
    await useInterestStore.getState().setOwner('guest');
    useInterestStore.getState().record('open', ['게임'], 'game');
    useInterestStore.getState().record('open', ['게임'], 'game');
    expect(useInterestStore.getState().profile.events).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(GUEST_INTEREST_KEY)!).profile.events).toHaveLength(1);
    expect(getInterestProfile).not.toHaveBeenCalled();
    expect(updateInterestProfile).not.toHaveBeenCalled();
  });

  test('continues in memory if local storage writes fail and stops collection when disabled', async () => {
    await useInterestStore.getState().setOwner('guest');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked');
    });
    useInterestStore.getState().record('open', ['게임'], 'game');
    expect(useInterestStore.getState().profile.events).toHaveLength(1);
    useInterestStore.getState().change('disable');
    useInterestStore.getState().record('open', ['게임'], 'another');
    expect(useInterestStore.getState().profile.events).toHaveLength(1);
  });

  test('keeps a failed account update for retry and clears it only after success', async () => {
    await useInterestStore.getState().setOwner('alice');
    useInterestStore.getState().change('follow', '게임');
    vi.mocked(updateInterestProfile).mockRejectedValueOnce(new Error('offline'));
    await useInterestStore.getState().sync();
    expect(useInterestStore.getState().pending).toHaveLength(1);
    expect(useInterestStore.getState().syncStatus).toBe('error');
    await useInterestStore.getState().sync();
    expect(useInterestStore.getState().pending).toHaveLength(0);
    expect(server.followedTags).toEqual(['게임']);
  });

  test('isolates late account responses after logout', async () => {
    let resolve!: (value: InterestProfile) => void;
    vi.mocked(getInterestProfile).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      })
    );
    const opening = useInterestStore.getState().setOwner('alice');
    await useInterestStore.getState().setOwner('guest');
    resolve({ ...emptyProfile(), followedTags: ['private'] });
    await opening;
    expect(useInterestStore.getState().owner).toBe('guest');
    expect(useInterestStore.getState().profile.followedTags).toEqual([]);
  });

  test('waits for an in-flight sync and drains later changes before returning', async () => {
    await useInterestStore.getState().setOwner('alice');
    useInterestStore.getState().change('follow', '게임');
    let resolve!: (value: InterestProfile) => void;
    vi.mocked(updateInterestProfile).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const first = useInterestStore.getState().sync();
    useInterestStore.getState().change('follow', '스포츠');
    const second = useInterestStore.getState().sync();
    server = { ...emptyProfile(), followedTags: ['게임'] };
    resolve(server);
    await Promise.all([first, second]);
    expect(server.followedTags).toEqual(['게임', '스포츠']);
    expect(useInterestStore.getState().pending).toHaveLength(0);
  });

  test('imports guest history only with login intent and retains it until acknowledgement', async () => {
    await useInterestStore.getState().setOwner('guest');
    useInterestStore.getState().record('open', ['게임'], 'game');
    await useInterestStore.getState().setOwner('alice');
    expect(useInterestStore.getState().pending).toHaveLength(0);
    localStorage.setItem(
      LOGIN_INTEREST_KEY,
      JSON.stringify({ guestId: 'guest-test', at: Date.now(), returnTo: '/board' })
    );
    useInterestStore.getState().importGuest();
    useInterestStore.getState().importGuest();
    expect(useInterestStore.getState().pending).toHaveLength(1);
    vi.mocked(updateInterestProfile).mockRejectedValueOnce(new Error('offline'));
    await useInterestStore.getState().sync();
    expect(JSON.parse(localStorage.getItem(GUEST_INTEREST_KEY)!).profile.events).toHaveLength(1);
    await useInterestStore.getState().sync();
    expect(server.events).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(GUEST_INTEREST_KEY)!).profile.events).toHaveLength(0);
  });

  test('does not import a pending consent into a different account', async () => {
    await useInterestStore.getState().setOwner('guest');
    useInterestStore.getState().record('open', ['게임'], 'game');
    localStorage.setItem(
      LOGIN_INTEREST_KEY,
      JSON.stringify({ guestId: 'guest-test', at: Date.now(), returnTo: '/board' })
    );
    await useInterestStore.getState().setOwner('alice');
    expect(useInterestStore.getState().pending).toHaveLength(1);
    await useInterestStore.getState().setOwner('bob');
    expect(useInterestStore.getState().pending).toHaveLength(0);
    expect(useInterestStore.getState().profile.events).toHaveLength(0);
  });
});

describe('recommendation controls', () => {
  test('waits for five distinct reads, shows once per session and respects a 30 day dismissal', async () => {
    await useInterestStore.getState().setOwner('guest');
    const props = { personalized: true, onModeChange: vi.fn(), onRefresh: vi.fn(), tags: ['게임'] };
    const view = render(<RecommendationControls {...props} />);
    expect(screen.queryByText('로그인하고 저장')).toBeNull();
    act(() => {
      Array.from({ length: 5 }, (_, index) =>
        useInterestStore.getState().record('open', ['게임'], String(index))
      );
    });
    expect(screen.getByText('로그인하고 저장')).toBeTruthy();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(Number(localStorage.getItem(NUDGE_DISMISSED_KEY))).toBeGreaterThan(
      Date.now() + 29 * DAY_MS
    );
    view.unmount();
    sessionStorage.clear();
    render(<RecommendationControls {...props} />);
    expect(screen.queryByText('로그인하고 저장')).toBeNull();
  });

  test('lets guests follow and hide tags, and confirms destructive reset', async () => {
    await useInterestStore.getState().setOwner('guest');
    const user = userEvent.setup();
    render(
      <RecommendationControls
        personalized
        onModeChange={vi.fn()}
        onRefresh={vi.fn()}
        tags={['게임']}
      />
    );
    await user.click(screen.getByRole('button', { name: '관심사 관리' }));
    await user.type(screen.getByRole('textbox', { name: '관심 태그' }), '게임');
    await user.click(screen.getByRole('button', { name: '추가' }));
    expect(useInterestStore.getState().profile.followedTags).toEqual(['게임']);
    await user.type(screen.getByRole('textbox', { name: '관심 태그' }), '정치');
    await user.click(screen.getByRole('button', { name: '숨기기' }));
    expect(useInterestStore.getState().profile.hiddenTags).toEqual(['정치']);
    await user.click(screen.getByRole('button', { name: '추천 기록 초기화' }));
    expect(useInterestStore.getState().profile.followedTags).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: '모두 초기화' }));
    expect(useInterestStore.getState().profile.followedTags).toEqual([]);
    expect(useInterestStore.getState().profile.hiddenTags).toEqual([]);
  });
});
