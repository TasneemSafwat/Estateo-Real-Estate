import { useTranslation } from 'react-i18next';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenuePoint } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { formatCompactNumber } from '@/utils/format';

const NAVY = '#153A41';
const GOLD = '#E89F12';
const GRID = 'rgba(14, 43, 49, 0.10)';

export interface RevenueChartProps {
  data: RevenuePoint[];
}

/** Monthly revenue trend with a secondary line for closed deals. */
export function RevenueChart({ data }: RevenueChartProps) {
  const { t, i18n } = useTranslation();
  const { currency, format } = useCurrency();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className="h-72 w-full" role="img" aria-label={t('admin.revenueChart')}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={NAVY} stopOpacity={0.28} />
              <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-subtle"
          />
          <YAxis
            yAxisId="revenue"
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-subtle"
            tickFormatter={(value: number) => formatCompactNumber(value, locale)}
          />
          <YAxis
            yAxisId="deals"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-subtle"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: '1px solid rgba(14, 43, 49, 0.12)',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
              fontSize: 13,
            }}
            formatter={(value, name) =>
              name === t('admin.chartsRevenue')
                ? [format(Number(value), currency), name]
                : [formatCompactNumber(Number(value), locale), name]
            }
          />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            name={t('admin.chartsRevenue')}
            stroke={NAVY}
            strokeWidth={2.5}
            fill="url(#revenueFill)"
          />
          <Line
            yAxisId="deals"
            type="monotone"
            dataKey="deals"
            name={t('admin.chartsDeals')}
            stroke={GOLD}
            strokeWidth={2.5}
            dot={{ r: 3, fill: GOLD, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
