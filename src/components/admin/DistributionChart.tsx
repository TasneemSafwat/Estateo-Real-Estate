import { useTranslation } from 'react-i18next';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DistributionPoint } from '@/types';
import { formatNumber } from '@/utils/format';

const COLORS = ['#153A41', '#E89F12', '#2A7F8A', '#F9CB57', '#5C969C', '#8CB9BD', '#C47C0A'];

export interface DistributionChartProps {
  data: DistributionPoint[];
}

/** Donut chart of listing volume per city. */
export function DistributionChart({ data }: DistributionChartProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className="h-72 w-full" role="img" aria-label={t('admin.distributionChart')}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: '1px solid rgba(14, 43, 49, 0.12)',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
              fontSize: 13,
            }}
            formatter={(value) => formatNumber(Number(value), locale)}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
