import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EngagementPoint } from '@/types';
import { formatCompactNumber } from '@/utils/format';

const GRID = 'rgba(14, 43, 49, 0.10)';

export interface EngagementChartProps {
  data: EngagementPoint[];
}

/** Buyer engagement funnel over time: views, saves and inquiries. */
export function EngagementChart({ data }: EngagementChartProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className="h-72 w-full" role="img" aria-label={t('admin.engagementChart')}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-subtle"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-subtle"
            tickFormatter={(value: number) => formatCompactNumber(value, locale)}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: '1px solid rgba(14, 43, 49, 0.12)',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
              fontSize: 13,
            }}
            formatter={(value) => formatCompactNumber(Number(value), locale)}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="views"
            name={t('admin.chartViews')}
            stroke="#153A41"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="saved"
            name={t('admin.chartSaved')}
            stroke="#E89F12"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="inquiries"
            name={t('admin.chartInquiries')}
            stroke="#8CB9BD"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
