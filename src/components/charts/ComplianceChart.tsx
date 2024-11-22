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

interface ComplianceChartProps {
  data: Array<{
    name: string;
    compliance: number;
  }>;
}

export function ComplianceChart({ data }: ComplianceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
          label={{ value: 'Compliance %', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Bar
          dataKey="compliance"
          fill="#6366F1"
          radius={[4, 4, 0, 0]}
          name="Compliance Rate"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}