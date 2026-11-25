import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/types';
import { ApiRequestError, simulateRequest } from './api/client';
import { DEMO_CREDENTIALS, DEFAULT_PREFERENCES, SEED_USERS } from './mock/users.data';
import { getUsers, pushActivity, updateUserRecord } from './mock/db';
import { buildAvatar } from '@/utils/images';

/**
 * Mock authentication.
 *
 * IMPORTANT: this is a front-end only demo. Credentials are checked against an
 * in-memory registry and the "token" is a base64 string — it is NOT secure and
 * must never be used in production.
 */

const credentials = new Map<string, string>([
  [DEMO_CREDENTIALS.admin.email, DEMO_CREDENTIALS.admin.password],
  [DEMO_CREDENTIALS.user.email, DEMO_CREDENTIALS.user.password],
]);

function createMockToken(user: User, remember: boolean): string {
  const ttlHours = remember ? 24 * 30 : 8;
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + ttlHours * 3600,
  };
  return btoa(JSON.stringify(payload));
}

function createSession(user: User, remember = false): AuthSession {
  const ttlHours = remember ? 24 * 30 : 8;
  return {
    user,
    token: createMockToken(user, remember),
    expiresAt: new Date(Date.now() + ttlHours * 3600 * 1000).toISOString(),
  };
}

export function login({ email, password, remember }: LoginPayload): Promise<AuthSession> {
  return simulateRequest(
    () => {
      const normalised = email.trim().toLowerCase();
      const user = getUsers().find((candidate) => candidate.email.toLowerCase() === normalised);
      const expected = credentials.get(normalised);

      if (!user || !expected || expected !== password) {
        throw new ApiRequestError(
          'Those credentials do not match our records. Check your email and password.',
          401,
          'INVALID_CREDENTIALS',
        );
      }

      pushActivity({
        actor: user.name,
        actorAvatar: user.avatar,
        action: 'signed in to',
        target: 'Estateo',
        type: 'login',
      });

      return createSession(user, remember);
    },
    { minDelay: 480, maxDelay: 900 },
  );
}

export function register({ name, email, password }: RegisterPayload): Promise<AuthSession> {
  return simulateRequest(
    () => {
      const normalised = email.trim().toLowerCase();
      if (getUsers().some((user) => user.email.toLowerCase() === normalised)) {
        throw new ApiRequestError(
          'An account with this email already exists. Try signing in instead.',
          409,
          'EMAIL_TAKEN',
        );
      }

      const user: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: normalised,
        role: 'user',
        avatar: buildAvatar(name, getUsers().length),
        phone: '',
        city: '',
        bio: '',
        createdAt: new Date().toISOString(),
        preferences: { ...DEFAULT_PREFERENCES },
      };

      // Register into the mock credential registry + user table.
      credentials.set(normalised, password);
      SEED_USERS.push(user);

      pushActivity({
        actor: user.name,
        actorAvatar: user.avatar,
        action: 'registered for',
        target: 'Estateo',
        type: 'create',
      });

      return createSession(user, true);
    },
    { minDelay: 620, maxDelay: 1_050 },
  );
}

export function requestPasswordReset(
  email: string,
): Promise<{ message: string; previewToken: string }> {
  return simulateRequest(
    () => {
      if (!email.includes('@')) {
        throw new ApiRequestError('Enter a valid email address.', 422, 'VALIDATION_ERROR');
      }
      // Always resolves — never reveal whether an account exists.
      return {
        message:
          'If an account exists for that address, a reset link is on its way. The link expires in 30 minutes.',
        previewToken: btoa(email.trim().toLowerCase()).slice(0, 24),
      };
    },
    { minDelay: 600, maxDelay: 1_000 },
  );
}

export function updateProfile(
  userId: string,
  patch: Pick<User, 'name' | 'phone' | 'city' | 'bio'>,
): Promise<User> {
  return simulateRequest(
    () => {
      const updated = updateUserRecord(userId, patch);
      if (!updated) throw new ApiRequestError('Account not found.', 404, 'NOT_FOUND');
      return updated;
    },
    { minDelay: 400, maxDelay: 760 },
  );
}

export function updatePreferences(
  userId: string,
  patch: Partial<User['preferences']>,
): Promise<User> {
  return simulateRequest(
    () => {
      const current = getUsers().find((user) => user.id === userId);
      if (!current) throw new ApiRequestError('Account not found.', 404, 'NOT_FOUND');
      const updated = updateUserRecord(userId, {
        preferences: { ...current.preferences, ...patch },
      });
      if (!updated) throw new ApiRequestError('Unable to save preferences.', 500);
      return updated;
    },
    { minDelay: 260, maxDelay: 520 },
  );
}

export function changePassword(
  _userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true }> {
  return simulateRequest(
    () => {
      if (newPassword.length < 8) {
        throw new ApiRequestError('Password must be at least 8 characters.', 422, 'VALIDATION_ERROR');
      }
      const known = [...credentials.values()];
      if (!known.includes(currentPassword)) {
        throw new ApiRequestError('Your current password is incorrect.', 401, 'INVALID_CREDENTIALS');
      }
      return { ok: true as const };
    },
    { minDelay: 520, maxDelay: 900 },
  );
}
