import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DailyDistributionChartProps {
  data: Array<{
    day: string;
    doses: number;
  }>;
}

export function DailyDistributionChart({ data }: DailyDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: 'Doses Taken', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Bar
          dataKey="doses"
          fill="#8B5CF6"
          radius={[4, 4, 0, 0]}
          name="Doses Taken"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}