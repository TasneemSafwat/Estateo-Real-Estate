import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Property, PropertyFilters, PropertyStatus, PropertyType } from '@/types';
import { deleteProperty, fetchProperties, queryKeys } from '@/services/propertyService';
import { DEFAULT_PROPERTY_FILTERS, paginate } from '@/services/propertyQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { useCurrency } from '@/hooks/useCurrency';
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR, ROUTES } from '@/utils/constants';
import { formatDate, formatNumber } from '@/utils/format';
import { Badge, type BadgeTone } from '@/components/common/Badge';
import { Button, IconButton, buttonStyles } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { EmptyState, ErrorState } from '@/components/common/Feedback';
import { Skeleton } from '@/components/common/Skeleton';
import { Pagination } from '@/components/common/Pagination';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { useLocalizeProperty } from '@/hooks/useLocalized';

const ADMIN_PAGE_SIZE = 8;
const STATUS_ORDER: PropertyStatus[] = ['active', 'pending', 'sold', 'draft'];

const STATUS_TONES: Record<PropertyStatus, BadgeTone> = {
  active: 'success',
  pending: 'warning',
  sold: 'neutral',
  draft: 'mist',
};

/** Admin catalogue table — search, filter, paginate and delete listings. */
export default function ManagePropertiesPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const toast = useToast();
  const localize = useLocalizeProperty();
  const queryClient = useQueryClient();
  const { priceOf } = useCurrency();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<PropertyStatus | 'all'>('all');
  const [type, setType] = useState<PropertyType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);

  const listFilters = useMemo<PropertyFilters>(
    () => ({ ...DEFAULT_PROPERTY_FILTERS, sort: 'newest', page: 1, pageSize: 500 }),
    [],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.list(listFilters),
    queryFn: ({ signal }) => fetchProperties(listFilters, signal),
    staleTime: 30 * 1000,
  });

  const all = useMemo(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return all.filter((property) => {
      if (status !== 'all' && property.status !== status) return false;
      if (type !== 'all' && property.type !== type) return false;
      if (
        term &&
        !`${property.title} ${property.location.city} ${property.location.district}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [all, status, type, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, type]);

  const paged = useMemo(() => paginate(filtered, page, ADMIN_PAGE_SIZE), [filtered, page]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: async () => {
      setPendingDelete(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.properties.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.activity });
      toast.success(t('admin.deleted'));
    },
    onError: (error) => {
      setPendingDelete(null);
      toast.fromError(error, t('common.error'));
    },
  });

  const typeOptions = useMemo(
    () =>
      (Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((value) => ({
        value,
        label: isArabic ? PROPERTY_TYPE_LABELS_AR[value] : PROPERTY_TYPE_LABELS[value],
      })),
    [isArabic],
  );

  const statusOptions = useMemo(
    () => STATUS_ORDER.map((value) => ({ value, label: value })),
    [],
  );

  const typeLabel = (value: PropertyType) =>
    isArabic ? PROPERTY_TYPE_LABELS_AR[value] : PROPERTY_TYPE_LABELS[value];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-subtle">
          {t('common.results', { count: filtered.length })}
        </p>
        <Link to={ROUTES.adminPropertyNew} className={buttonStyles({ variant: 'primary', size: 'sm' })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('admin.addProperty')}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.tableSearch')}
            aria-label={t('admin.tableSearch')}
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as PropertyStatus | 'all')}
          aria-label={t('admin.statusFilter')}
          options={[{ value: 'all', label: t('common.all') }, ...statusOptions]}
        />
        <Select
          value={type}
          onChange={(event) => setType(event.target.value as PropertyType | 'all')}
          aria-label={t('admin.typeFilter')}
          options={[{ value: 'all', label: t('common.all') }, ...typeOptions]}
        />
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
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-subtle">
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.property')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.type')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.price')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.status')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.views')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    {t('admin.created')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-end font-semibold">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paged.items.map(localize).map((property) => (
                  <tr key={property.id} className="transition-colors hover:bg-brand-800/4 dark:hover:bg-white/4">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={property.coverImage}
                          alt={property.title}
                          wrapperClassName="h-11 w-11 shrink-0 rounded-lg"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{property.title}</p>
                          <p className="truncate text-xs text-subtle">
                            {property.location.city} · {property.location.district}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-subtle">{typeLabel(property.type)}</td>
                    <td className="px-4 py-3 font-medium text-ink">{priceOf(property, { compact: true })}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONES[property.status]} className="capitalize">
                        {property.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-subtle">{formatNumber(property.views, locale)}</td>
                    <td className="px-4 py-3 text-subtle">{formatDate(property.createdAt, locale)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={ROUTES.property(property.id)}
                          aria-label={t('common.view')}
                          className={buttonStyles({ variant: 'ghost', size: 'icon-sm' })}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                          to={ROUTES.adminPropertyEdit(property.id)}
                          aria-label={t('common.edit')}
                          className={buttonStyles({ variant: 'ghost', size: 'icon-sm' })}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <IconButton
                          label={t('common.delete')}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => setPendingDelete(property)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {paged.items.map(localize).map((property) => (
              <li key={property.id} className="surface-card p-4">
                <div className="flex gap-3">
                  <ImageWithFallback
                    src={property.coverImage}
                    alt={property.title}
                    wrapperClassName="h-16 w-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{property.title}</p>
                    <p className="truncate text-xs text-subtle">
                      {property.location.city} · {typeLabel(property.type)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge tone={STATUS_TONES[property.status]} className="capitalize">
                        {property.status}
                      </Badge>
                      <span className="text-sm font-semibold text-ink">
                        {priceOf(property, { compact: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={ROUTES.adminPropertyEdit(property.id)}
                    className={buttonStyles({ variant: 'outline', size: 'sm', className: 'flex-1' })}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    {t('common.edit')}
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-500/10"
                    leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => setPendingDelete(property)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} compact />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('admin.deleteTitle')}
        description={t('admin.deleteBody', { title: pendingDelete?.title ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        isLoading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
