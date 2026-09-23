import type { BoardPost } from 'src/api/board-api';
import type {
  InterestKind,
  InterestProfile,
  InterestMutation,
} from 'src/personalization/interests';

import { create } from 'zustand';

import { getInterestProfile, updateInterestProfile } from 'src/api/recommendation-api';
import {
  tagKey,
  readLocal,
  writeLocal,
  emptyProfile,
  newInterestId,
  normalizeProfile,
  applyInterestMutation,
} from 'src/personalization/interests';

export const GUEST_INTEREST_KEY = 'tag-interests:v1:guest';
export const LOGIN_INTEREST_KEY = 'tag-interests:v1:login';
export const NUDGE_DISMISSED_KEY = 'tag-interests:v1:dismissed';
type GuestData = { id: string; profile: InterestProfile };
export type InterestLoginIntent = { guestId: string; returnTo: string; at: number; owner?: string };

const pendingKey = (owner: string) => `tag-interests:v1:pending:${owner}`;
let epoch = 0;
let syncingEpoch: number | null = null;
let syncTask: Promise<void> | null = null;
let guestMemory: GuestData | null = null;

export function getGuestInterests(): GuestData {
  const saved = readLocal<GuestData>(GUEST_INTEREST_KEY) ?? guestMemory;
  return {
    id:
      typeof saved?.id === 'string' && saved.id.length > 0 && saved.id.length <= 80
        ? saved.id
        : newInterestId(),
    profile: normalizeProfile(saved?.profile),
  };
}

function saveGuest(data: GuestData) {
  guestMemory = data;
  writeLocal(GUEST_INTEREST_KEY, data);
}

function loadPending(owner: string): InterestMutation[] {
  const saved = readLocal<InterestMutation[]>(pendingKey(owner));
  return Array.isArray(saved)
    ? saved
        .filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            item.id.length > 0 &&
            item.id.length <= 100 &&
            [
              'record',
              'follow',
              'unfollow',
              'hide',
              'unhide',
              'reset',
              'enable',
              'disable',
              'merge',
            ].includes(item.kind) &&
            Number.isFinite(Date.parse(item.at)) &&
            Date.parse(item.at) > Date.now() - 30 * 86400000 &&
            Date.parse(item.at) <= Date.now() + 300000
        )
        .slice(-500)
        .map((item) => ({
          id: item.id,
          kind: item.kind,
          at: new Date(item.at).toISOString(),
          tag: typeof item.tag === 'string' ? tagKey(item.tag) : '',
          events: normalizeProfile({ ...emptyProfile(), events: item.events }).events,
          ...(item.profile ? { profile: normalizeProfile(item.profile) } : {}),
        }))
    : [];
}

interface InterestStore {
  owner: string | null;
  profile: InterestProfile;
  pending: InterestMutation[];
  ready: boolean;
  syncStatus: 'idle' | 'saving' | 'error';
  setOwner: (owner: string | null) => Promise<void>;
  sync: () => Promise<void>;
  change: (kind: InterestMutation['kind'], tag?: string) => void;
  record: (kind: InterestKind, tags: string[], boardId?: string) => void;
  importGuest: () => void;
}

function enqueue(mutation: InterestMutation) {
  const state = useInterestStore.getState();
  if (!state.owner || !state.ready) return;
  const profile = applyInterestMutation(state.profile, mutation);
  if (state.owner === 'guest') {
    const saved = getGuestInterests();
    saveGuest({ id: saved.id, profile });
    useInterestStore.setState({ profile });
  } else {
    if (state.pending.some((item) => item.id === mutation.id)) return;
    const pending = [...state.pending, mutation].slice(-500);
    writeLocal(pendingKey(state.owner), pending);
    useInterestStore.setState({ profile, pending });
  }
}

export const useInterestStore = create<InterestStore>((set, get) => ({
  owner: null,
  profile: emptyProfile(),
  pending: [],
  ready: false,
  syncStatus: 'idle',
  setOwner: async (owner) => {
    if (get().owner === owner) return;
    epoch += 1;
    const currentEpoch = epoch;
    set({ owner, profile: emptyProfile(), pending: [], ready: false, syncStatus: 'idle' });
    if (!owner) return;
    if (owner === 'guest') {
      const guest = getGuestInterests();
      saveGuest(guest);
      set({ profile: guest.profile, ready: true });
      return;
    }
    const pending = loadPending(owner);
    set({ pending, syncStatus: 'saving' });
    try {
      const profile = normalizeProfile(await getInterestProfile());
      if (epoch !== currentEpoch) return;
      set({
        profile: pending.reduce(
          (value, mutation) => applyInterestMutation(value, mutation),
          profile
        ),
        ready: true,
        syncStatus: 'idle',
      });
    } catch {
      if (epoch !== currentEpoch) return;
      set({
        profile: pending.reduce(
          (value, mutation) => applyInterestMutation(value, mutation),
          emptyProfile()
        ),
        ready: true,
        syncStatus: 'error',
      });
    }
    if (epoch === currentEpoch) get().importGuest();
  },
  sync: async () => {
    const { owner, pending, ready } = get();
    if (!owner || owner === 'guest' || !ready) return;
    if (syncingEpoch === epoch && syncTask) {
      await syncTask;
      if (get().owner === owner && get().pending.length && get().syncStatus !== 'error')
        await get().sync();
      return;
    }
    const currentEpoch = epoch;
    syncingEpoch = currentEpoch;
    const sent = pending.slice(0, 20);
    set({ syncStatus: 'saving' });
    syncTask = (async () => {
      try {
        const response = sent.length
          ? await updateInterestProfile(sent)
          : await getInterestProfile();
        if (epoch !== currentEpoch) return;
        const sentIds = new Set(sent.map((item) => item.id));
        const remaining = get().pending.filter((item) => !sentIds.has(item.id));
        writeLocal(pendingKey(owner), remaining);
        set({
          pending: remaining,
          profile: remaining.reduce(
            (value, mutation) => applyInterestMutation(value, mutation),
            normalizeProfile(response)
          ),
          syncStatus: 'idle',
        });
        const imported = sent.find((item) => item.kind === 'merge');
        if (imported?.profile) {
          const guest = getGuestInterests();
          if (imported.id === `merge:${guest.id}`) {
            const importedIds = new Set(imported.profile.events.map((event) => event.id));
            saveGuest({
              id: newInterestId(),
              profile: normalizeProfile({
                ...guest.profile,
                events: guest.profile.events.filter((event) => !importedIds.has(event.id)),
                followedTags: guest.profile.followedTags.filter(
                  (tag) => !imported.profile!.followedTags.includes(tag)
                ),
                hiddenTags: guest.profile.hiddenTags.filter(
                  (tag) => !imported.profile!.hiddenTags.includes(tag)
                ),
              }),
            });
          }
          writeLocal(LOGIN_INTEREST_KEY, null);
        }
      } catch {
        if (epoch === currentEpoch) set({ syncStatus: 'error' });
      } finally {
        if (syncingEpoch === currentEpoch) syncingEpoch = null;
      }
    })();
    await syncTask;
    if (epoch === currentEpoch && get().pending.length && get().syncStatus !== 'error')
      await get().sync();
  },
  change: (kind, tag) => enqueue({ id: newInterestId(), at: new Date().toISOString(), kind, tag }),
  record: (kind, tags, boardId) => {
    const { profile, ready } = get();
    if (!ready || !profile.enabled || !tags.length) return;
    const at = new Date().toISOString();
    const normalizedTags = Array.from(new Set(tags.map(tagKey).filter(Boolean))).slice(0, 20);
    if (!normalizedTags.length || (kind !== 'tag' && !boardId)) return;
    if (
      profile.events.some(
        (event) =>
          event.kind === kind &&
          event.at.slice(0, 10) === at.slice(0, 10) &&
          (kind === 'tag' ? event.tags[0] === normalizedTags[0] : event.boardId === boardId)
      )
    )
      return;
    enqueue({
      id: newInterestId(),
      at,
      kind: 'record',
      events: [
        { id: newInterestId(), at, kind, tags: normalizedTags, ...(boardId ? { boardId } : {}) },
      ],
    });
  },
  importGuest: () => {
    const { owner, ready } = get();
    const intent = readLocal<InterestLoginIntent>(LOGIN_INTEREST_KEY);
    if (!owner || owner === 'guest' || !ready || !intent || Date.now() - intent.at > 3600000)
      return;
    const guest = getGuestInterests();
    if (intent.guestId !== guest.id) return;
    if (intent.owner && intent.owner !== owner) return;
    writeLocal(LOGIN_INTEREST_KEY, { ...intent, owner });
    enqueue({
      id: `merge:${guest.id}`,
      at: new Date().toISOString(),
      kind: 'merge',
      profile: guest.profile,
    });
  },
}));

export function recordPostInterest(kind: Exclude<InterestKind, 'tag'>, post: BoardPost) {
  if (post.Id) useInterestStore.getState().record(kind, post.tags ?? [], post.Id);
}

export function recordTagInterest(tag: string) {
  useInterestStore.getState().record('tag', [tag]);
}
