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

interface EngagementChartProps {
  data: Array<{
    date: string;
    taken: number;
    skipped: number;
  }>;
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
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
  );
}