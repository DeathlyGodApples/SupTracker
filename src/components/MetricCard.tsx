import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function MetricCard({ title, value, icon: Icon, color, bgColor }: MetricCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${color} text-sm font-medium`}>{title}</p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`h-12 w-12 ${color}`} />
      </div>
    </div>
  );
}