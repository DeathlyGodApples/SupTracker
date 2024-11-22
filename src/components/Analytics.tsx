import React from 'react';
import { Users, PieChart, Clock, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { EngagementChart } from './charts/EngagementChart';
import { ComplianceChart } from './charts/ComplianceChart';
import { DailyDistributionChart } from './charts/DailyDistributionChart';
import type { Medication, MedicationLog } from '../types';
import { isBefore, startOfDay, eachDayOfInterval, subDays, format, startOfWeek } from 'date-fns';

interface AnalyticsProps {
  medications: Medication[];
  logs: MedicationLog[];
}

export function Analytics({ medications, logs }: AnalyticsProps) {
  const activeMedications = medications.length;

  const totalDoses = logs.filter(log => {
    const medication = medications.find(med => med.id === log.medicationId);
    if (!medication) return false;
    
    return log.status === 'taken' && 
           !isBefore(new Date(log.timestamp), startOfDay(new Date(medication.createdAt)));
  }).length;
  
  const dailyReminders = medications.reduce((total, med) => {
    if (!med.schedule || !Array.isArray(med.schedule.times)) {
      return total;
    }
    return total + med.schedule.times.length;
  }, 0);
  
  const calculateComplianceRate = () => {
    const validLogs = logs.filter(log => {
      const medication = medications.find(med => med.id === log.medicationId);
      return medication && !isBefore(new Date(log.timestamp), new Date(medication.createdAt));
    });

    if (validLogs.length === 0) return 0;
    const takenLogs = validLogs.filter(log => log.status === 'taken').length;
    return Math.round((takenLogs / validLogs.length) * 100);
  };

  // Prepare data for charts
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const engagementData = last30Days.map(date => {
    const dayLogs = logs.filter(log => 
      format(new Date(log.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    return {
      date: format(date, 'MMM dd'),
      taken: dayLogs.filter(log => log.status === 'taken').length,
      skipped: dayLogs.filter(log => log.status === 'skipped').length
    };
  });

  const complianceData = medications.map(med => {
    const medLogs = logs.filter(log => log.medicationId === med.id);
    const taken = medLogs.filter(log => log.status === 'taken').length;
    const total = medLogs.length;
    const rate = total === 0 ? 0 : Math.round((taken / total) * 100);
    
    return {
      name: med.name,
      compliance: rate
    };
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const distributionData = daysOfWeek.map(day => {
    const dayNumber = daysOfWeek.indexOf(day);
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getDay() === dayNumber && log.status === 'taken';
    });

    return {
      day,
      doses: dayLogs.length
    };
  });

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Active Medications"
        value={activeMedications}
        icon={Users}
        color="text-purple-600 dark:text-purple-400"
        bgColor="bg-purple-50 dark:bg-purple-900/20"
      />
      <MetricCard
        title="Total Doses Taken"
        value={totalDoses}
        icon={PieChart}
        color="text-green-600 dark:text-green-400"
        bgColor="bg-green-50 dark:bg-green-900/20"
      />
      <MetricCard
        title="Daily Reminders"
        value={dailyReminders}
        icon={Clock}
        color="text-orange-600 dark:text-orange-400"
        bgColor="bg-orange-50 dark:bg-orange-900/20"
      />
      <MetricCard
        title="Compliance Rate"
        value={`${calculateComplianceRate()}%`}
        icon={TrendingUp}
        color="text-blue-600 dark:text-blue-400"
        bgColor="bg-blue-50 dark:bg-blue-900/20"
      />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              30-Day Engagement
            </h3>
            <EngagementChart data={engagementData} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Compliance by Medication
            </h3>
            <ComplianceChart data={complianceData} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Distribution
          </h3>
          <DailyDistributionChart data={distributionData} />
        </div>
      </div>
    </div>
  );
}