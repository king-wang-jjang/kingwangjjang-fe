import type { UserType, UserTypeWithoutNull } from 'src/auth/types';

import { getMe } from 'src/api/user-api';
import { ApiError, getAuthRefreshResult } from 'src/api/http';

type SessionRecoveryResult =
  | { status: 'authenticated'; user: UserTypeWithoutNull }
  | { status: 'unauthenticated' }
  | { status: 'unavailable' };

const TRANSIENT_RETRY_DELAYS_MS = [250, 750];

let recoveryPromise: Promise<SessionRecoveryResult> | null = null;

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function isTransientRequestError(error: unknown) {
  if (!(error instanceof ApiError)) return true;

  return error.status === 408 || error.status === 429 || error.status >= 500;
}

function isUnauthenticatedRequestError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

async function getMeWithRetry(retryIndex = 0): Promise<UserType> {
  try {
    return await getMe({ skipAuthRefresh: true });
  } catch (error) {
    if (!isTransientRequestError(error) || retryIndex >= TRANSIENT_RETRY_DELAYS_MS.length) {
      throw error;
    }

    await wait(TRANSIENT_RETRY_DELAYS_MS[retryIndex]);
    return getMeWithRetry(retryIndex + 1);
  }
}

async function getMeAfterRefresh(retryIndex = 0): Promise<UserType> {
  const user = await getMeWithRetry();
  if (user || retryIndex >= TRANSIENT_RETRY_DELAYS_MS.length) {
    return user;
  }

  await wait(TRANSIENT_RETRY_DELAYS_MS[retryIndex]);
  return getMeAfterRefresh(retryIndex + 1);
}

async function refreshWithRetry(retryIndex = 0) {
  const result = await getAuthRefreshResult();

  if (result !== 'unavailable') {
    return result;
  }

  try {
    const recoveredUser = await getMeWithRetry();
    if (recoveredUser) return 'refreshed';
  } catch {
    // A transient probe failure is handled by the bounded refresh retry below.
  }

  if (retryIndex >= TRANSIENT_RETRY_DELAYS_MS.length) return 'unavailable';

  await wait(TRANSIENT_RETRY_DELAYS_MS[retryIndex]);
  return refreshWithRetry(retryIndex + 1);
}

async function runSessionRecovery(): Promise<SessionRecoveryResult> {
  try {
    const currentUser = await getMeWithRetry();
    if (currentUser) {
      return { status: 'authenticated', user: currentUser };
    }

    const refreshResult = await refreshWithRetry();
    if (refreshResult === 'unavailable') {
      return { status: 'unavailable' };
    }

    // Another tab can win refresh-token rotation. Re-probe even after a 401 because
    // the winner may replace this origin's shared cookies shortly after our response.
    const recoveredUser = await getMeAfterRefresh();
    return recoveredUser
      ? { status: 'authenticated', user: recoveredUser }
      : { status: 'unauthenticated' };
  } catch (error) {
    return {
      status: isUnauthenticatedRequestError(error) ? 'unauthenticated' : 'unavailable',
    };
  }
}

export function recoverAuthSession(): Promise<SessionRecoveryResult> {
  if (!recoveryPromise) {
    recoveryPromise = runSessionRecovery().finally(() => {
      recoveryPromise = null;
    });
  }

  return recoveryPromise;
}
