import type { ActivityEntry, User, UserRole } from '@/types';
import { ApiRequestError, simulateRequest } from './api/client';
import { getActivity, getUsers, removeUserRecord, updateUserRecord } from './mock/db';

export function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  return simulateRequest(() => getUsers(), { signal, minDelay: 200, maxDelay: 460 });
}

export function fetchActivity(signal?: AbortSignal): Promise<ActivityEntry[]> {
  return simulateRequest(() => getActivity(), { signal, minDelay: 180, maxDelay: 420 });
}

export function updateUserRole(id: string, role: UserRole): Promise<User> {
  return simulateRequest(
    () => {
      const updated = updateUserRecord(id, { role });
      if (!updated) throw new ApiRequestError('User not found.', 404, 'NOT_FOUND');
      return updated;
    },
    { minDelay: 300, maxDelay: 620 },
  );
}

export function deleteUser(id: string): Promise<{ id: string }> {
  return simulateRequest(
    () => {
      const removed = removeUserRecord(id);
      if (!removed) throw new ApiRequestError('User not found.', 404, 'NOT_FOUND');
      return { id };
    },
    { minDelay: 340, maxDelay: 680 },
  );
}
