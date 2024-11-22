import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useDarkMode } from '../../hooks/useDarkMode';

interface EngagementChartProps {
  data: Array<{
    date: string;
    taken: number;
    skipped: number;
  }>;
}

export function EngagementChart({ data }: EngagementChartProps) {
  const [isDark] = useDarkMode();

  return (
    <div className="card bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="h-[300px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#4B5563' : '#E5E7EB'} 
            />
            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }}
            />
            <YAxis 
              tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }}
            />
            <Tooltip 
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
            <Legend />
            <Line
              type="monotone"
              dataKey="taken"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="Taken"
            />
            <Line
              type="monotone"
              dataKey="skipped"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              name="Skipped"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}