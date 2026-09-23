export type InterestKind = 'tag' | 'open' | 'source' | 'like' | 'dismiss';
export type InterestEvent = {
  id: string;
  kind: InterestKind;
  at: string;
  boardId?: string;
  tags: string[];
};
export type InterestProfile = {
  schemaVersion: 1;
  enabled: boolean;
  events: InterestEvent[];
  followedTags: string[];
  hiddenTags: string[];
  resetAt: string | null;
};
export type InterestMutation = {
  id: string;
  at: string;
  kind:
    | 'record'
    | 'follow'
    | 'unfollow'
    | 'hide'
    | 'unhide'
    | 'reset'
    | 'enable'
    | 'disable'
    | 'merge';
  tag?: string;
  events?: InterestEvent[];
  profile?: InterestProfile;
};

export const DAY_MS = 86400000;
const WEIGHTS: Record<InterestKind, number> = { tag: 1, open: 2, source: 3, like: 5, dismiss: -4 };

export const emptyProfile = (): InterestProfile => ({
  schemaVersion: 1,
  enabled: true,
  events: [],
  followedTags: [],
  hiddenTags: [],
  resetAt: null,
});

export function tagKey(tag: string) {
  return tag.normalize('NFKC').trim().replace(/^#+/, '').trim().toLowerCase().slice(0, 100);
}

function cleanTags(value: unknown, limit = 100): string[] {
  return Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .filter((tag): tag is string => typeof tag === 'string')
            .map(tagKey)
            .filter(Boolean)
        )
      ).slice(0, limit)
    : [];
}

export function normalizeProfile(value: unknown, now = Date.now()): InterestProfile {
  if (!value || typeof value !== 'object' || (value as InterestProfile).schemaVersion !== 1)
    return emptyProfile();
  const input = value as InterestProfile;
  const resetAt =
    typeof input.resetAt === 'string' && Number.isFinite(Date.parse(input.resetAt))
      ? input.resetAt
      : null;
  const events = new Map<string, InterestEvent>();
  (Array.isArray(input.events) ? input.events : []).forEach((raw) => {
    if (
      !raw ||
      typeof raw.id !== 'string' ||
      !raw.id ||
      raw.id.length > 100 ||
      !Object.hasOwn(WEIGHTS, raw.kind)
    )
      return;
    const at = Date.parse(raw.at);
    if (
      !Number.isFinite(at) ||
      at < now - 30 * DAY_MS ||
      at > now + 300000 ||
      (resetAt && at <= Date.parse(resetAt))
    )
      return;
    const tags = cleanTags(raw.tags, 20);
    if (
      !tags.length ||
      (raw.kind !== 'tag' &&
        (typeof raw.boardId !== 'string' || !raw.boardId || raw.boardId.length > 100))
    )
      return;
    const key = `${raw.kind}:${raw.kind === 'tag' ? tags[0] : raw.boardId}:${new Date(at).toISOString().slice(0, 10)}`;
    if (!events.has(key) || Date.parse(events.get(key)!.at) < at) {
      events.set(key, {
        id: raw.id,
        kind: raw.kind,
        at: new Date(at).toISOString(),
        tags,
        ...(raw.boardId ? { boardId: raw.boardId } : {}),
      });
    }
  });
  return {
    schemaVersion: 1,
    enabled: input.enabled !== false,
    events: Array.from(events.values())
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
      .slice(-500),
    followedTags: cleanTags(input.followedTags),
    hiddenTags: cleanTags(input.hiddenTags),
    resetAt,
  };
}

export function applyInterestMutation(
  profile: InterestProfile,
  mutation: InterestMutation,
  now = Date.now()
): InterestProfile {
  const next = normalizeProfile(profile, now);
  const at = Date.parse(mutation.at);
  if (
    !Number.isFinite(at) ||
    at < now - 30 * DAY_MS ||
    at > now + 300000 ||
    (next.resetAt && at <= Date.parse(next.resetAt))
  )
    return next;
  const tag = tagKey(mutation.tag ?? '');
  if (mutation.kind === 'reset')
    return {
      ...emptyProfile(),
      enabled: next.enabled,
      resetAt: new Date(Math.min(at, now)).toISOString(),
    };
  if (mutation.kind === 'enable' || mutation.kind === 'disable')
    next.enabled = mutation.kind === 'enable';
  else if (mutation.kind === 'record' && next.enabled) next.events.push(...(mutation.events ?? []));
  else if (mutation.kind === 'merge' && mutation.profile) {
    const incoming = normalizeProfile(mutation.profile, now);
    if (next.enabled) next.events.push(...incoming.events);
    next.hiddenTags = cleanTags([...next.hiddenTags, ...incoming.hiddenTags]);
    next.followedTags = cleanTags([...next.followedTags, ...incoming.followedTags]).filter(
      (key) => !next.hiddenTags.includes(key)
    );
  } else if (tag) {
    if (mutation.kind === 'follow') {
      next.followedTags = cleanTags([...next.followedTags, tag]);
      next.hiddenTags = next.hiddenTags.filter((key) => key !== tag);
    } else if (mutation.kind === 'unfollow')
      next.followedTags = next.followedTags.filter((key) => key !== tag);
    else if (mutation.kind === 'hide') {
      next.hiddenTags = cleanTags([...next.hiddenTags, tag]);
      next.followedTags = next.followedTags.filter((key) => key !== tag);
    } else if (mutation.kind === 'unhide')
      next.hiddenTags = next.hiddenTags.filter((key) => key !== tag);
  }
  return normalizeProfile(next, now);
}

export function getInterestScores(profile: InterestProfile, now = Date.now()) {
  const current = normalizeProfile(profile, now);
  const scores = new Map<string, number>();
  if (!current.enabled) return scores;
  const signals = new Map<string, InterestEvent>();
  current.events.forEach((event) => {
    const group = event.kind === 'dismiss' ? 'dismiss' : event.kind === 'tag' ? 'tag' : 'post';
    const key = `${group}:${event.kind === 'tag' ? event.tags[0] : event.boardId}:${event.at.slice(0, 10)}`;
    if (!signals.has(key) || WEIGHTS[event.kind] > WEIGHTS[signals.get(key)!.kind])
      signals.set(key, event);
  });
  signals.forEach((event) => {
    const weight =
      (WEIGHTS[event.kind] * 0.5 ** (Math.max(0, now - Date.parse(event.at)) / (14 * DAY_MS))) /
      event.tags.length;
    event.tags.forEach((tag) => scores.set(tag, (scores.get(tag) ?? 0) + weight));
  });
  current.followedTags.forEach((tag) => scores.set(tag, Math.max(0, scores.get(tag) ?? 0) + 10));
  current.hiddenTags.forEach((tag) => scores.delete(tag));
  return scores;
}

export function readLocal<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Keep browsing with memory state. */
  }
}

export function newInterestId() {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
