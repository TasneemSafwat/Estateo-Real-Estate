import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Trash2 } from 'lucide-react';
import type { User, UserRole } from '@/types';
import { fetchUsers, deleteUser, updateUserRole } from '@/services/userService';
import { queryKeys } from '@/services/propertyService';
import { useAuth } from '@/hooks/useAuth';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/utils/format';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Button, IconButton } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { EmptyState, ErrorState } from '@/components/common/Feedback';
import { Skeleton } from '@/components/common/Skeleton';

/** Admin user directory — search accounts, adjust roles and remove users. */
export default function ManageUsersPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 30 * 1000,
  });

  const filtered = useMemo(() => {
    const users = data ?? [];
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.city}`.toLowerCase().includes(term),
    );
  }, [data, debouncedSearch]);

  const roleOptions = useMemo(
    () => [
      { value: 'user', label: t('admin.roleUser') },
      { value: 'admin', label: t('admin.roleAdmin') },
    ],
    [t],
  );

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRole(id, role),
    onSuccess: async () => {
      setRoleUpdatingId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      toast.success(t('admin.roleUpdated'));
    },
    onError: (error) => {
      setRoleUpdatingId(null);
      toast.fromError(error, t('common.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      setPendingDelete(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.activity });
      toast.success(t('admin.userDeleted'));
    },
    onError: (error) => {
      setPendingDelete(null);
      toast.fromError(error, t('common.error'));
    },
  });

  const handleRoleChange = (user: User, role: string) => {
    if (role === user.role) return;
    setRoleUpdatingId(user.id);
    roleMutation.mutate({ id: user.id, role: role as UserRole });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-subtle">{t('common.results', { count: filtered.length })}</p>
        <div className="w-full sm:w-72">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.tableSearchUsers')}
            aria-label={t('admin.tableSearchUsers')}
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} retryLabel={t('common.retry')} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('admin.noRows')} description={t('explore.emptyBody')} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-panel lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-subtle">
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.user')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.role')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.city')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.joined')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-end font-semibold">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-brand-800/4 dark:hover:bg-white/4"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name} size="sm" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 truncate font-medium text-ink">
                              {user.name}
                              {isSelf && <Badge tone="accent">{t('admin.you')}</Badge>}
                            </p>
                            <p className="truncate text-xs text-subtle">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-40">
                          <Select
                            value={user.role}
                            disabled={isSelf || roleUpdatingId === user.id}
                            onChange={(event) => handleRoleChange(user, event.target.value)}
                            aria-label={t('admin.role')}
                            options={roleOptions}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-subtle">{user.city}</td>
                      <td className="px-4 py-3 text-subtle">{formatDate(user.createdAt, locale)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <IconButton
                            label={t('common.delete')}
                            size="sm"
                            variant="ghost"
                            disabled={isSelf}
                            className="text-red-500 hover:bg-red-500/10"
                            onClick={() => setPendingDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((user) => {
              const isSelf = user.id === currentUser?.id;
              return (
                <li key={user.id} className="surface-card p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-medium text-ink">
                        {user.name}
                        {isSelf && <Badge tone="accent">{t('admin.you')}</Badge>}
                      </p>
                      <p className="truncate text-xs text-subtle">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        value={user.role}
                        disabled={isSelf || roleUpdatingId === user.id}
                        onChange={(event) => handleRoleChange(user, event.target.value)}
                        aria-label={t('admin.role')}
                        options={roleOptions}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSelf}
                      className="text-red-500 hover:bg-red-500/10"
                      leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => setPendingDelete(user)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('admin.deleteUserTitle')}
        description={t('admin.deleteUserBody', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        isLoading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
