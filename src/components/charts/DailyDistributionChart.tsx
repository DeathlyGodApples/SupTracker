import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useDarkMode } from '../../hooks/useDarkMode';

interface DailyDistributionChartProps {
  data: Array<{
    day: string;
    doses: number;
  }>;
}

export function DailyDistributionChart({ data }: DailyDistributionChartProps) {
  const [isDark] = useDarkMode();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const baseColor = '#8B5CF6';
  const hoverColor = '#A78BFA';

  return (
    <div className="card bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="h-[300px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#4B5563' : '#E5E7EB'} 
            />
            <XAxis
              dataKey="day"
              tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }}
            />
            <YAxis 
              tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }}
            />
            <Tooltip 
              cursor={false}
              contentStyle={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                borderRadius: '6px',
                padding: '8px',
              }}
              labelStyle={{
                color: isDark ? '#F3F4F6' : '#111827',
                marginBottom: '4px',
                fontWeight: 500,
              }}
              itemStyle={{
                color: isDark ? '#D1D5DB' : '#4B5563',
              }}
            />
            <Bar
              dataKey="doses"
              radius={[4, 4, 0, 0]}
              name="Doses Taken"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={activeIndex === index ? hoverColor : baseColor}
                  style={{ transition: 'fill 0.3s ease' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}