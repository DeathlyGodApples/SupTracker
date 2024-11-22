/**
 * YearlyCalendar Component
 * A modern, animated yearly view calendar for medication tracking
 */

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  isToday, getDay, getMonth, eachMonthOfInterval } from 'date-fns';
import type { Medication, MedicationLog } from '../types';

interface YearlyCalendarProps {
  medications: Medication[];
  logs: MedicationLog[];
  year: number;
  yearRange?: { start: number; end: number };
  onYearClick?: (year: number) => void;
  onMonthClick: (month: number) => void;
}

const WEEKDAY_HEADERS = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' }
];

export function YearlyCalendar({ 
  medications, 
  logs, 
  year, 
  yearRange, 
  onYearClick, 
  onMonthClick 
}: YearlyCalendarProps) {
  const years = yearRange 
    ? Array.from({ length: yearRange.end - yearRange.start + 1 }, (_, i) => yearRange.start + i)
    : [year];

  const getMonthsForYear = (year: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      return {
        name: format(date, 'MMMM'),
        days,
        startDay: getDay(monthStart)
      };
    });
  };

  const getStatusForDay = (date: Date) => {
    const dayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), date));
    const dayMeds = medications.filter(med => {
      const medStartDate = new Date(med.createdAt);
      if (date < medStartDate) return false;

      if (med.schedule.yearRange) {
        const year = date.getFullYear();
        if (year < med.schedule.yearRange.start || year > med.schedule.yearRange.end) {
          return false;
        }
      }

      switch (med.schedule.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          return med.schedule.daysOfWeek?.includes(getDay(date));
        case 'monthly':
          return med.schedule.months?.includes(getMonth(date)) &&
                 med.schedule.daysOfMonth?.includes(getDay(date));
        default:
          return false;
      }
    });

    if (dayMeds.length === 0) return 'none';
    const takenCount = dayLogs.filter(log => log.status === 'taken').length;
    
    if (takenCount === dayMeds.length) return 'complete';
    if (takenCount > 0) return 'partial';
    if (date > new Date()) return 'none';
    return 'missed';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 
      animate-[scaleIn_0.3s_ease-out]">
      {years.map((year, yearIndex) => (
        <React.Fragment key={year}>
          {getMonthsForYear(year).map((month, monthIndex) => (
            <div
              key={`${year}-${month.name}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border 
                border-gray-200 dark:border-gray-700 p-4 hover:shadow-md 
                dark:hover:bg-gray-750 transition-all duration-300 cursor-pointer
                transform-gpu hover:scale-[1.02] hover:border-indigo-500 
                dark:hover:border-indigo-400"
              onClick={() => {
                if (yearRange && onYearClick) {
                  onYearClick(year);
                } else {
                  onMonthClick(monthIndex);
                }
              }}
              style={{ 
                animationDelay: `${(yearIndex * 12 + monthIndex) * 50}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3
                group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                transition-colors duration-200">
                {yearRange ? `${month.name} ${year}` : month.name}
              </h3>
              
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_HEADERS.map(day => (
                  <div 
                    key={`${year}-${month.name}-${day.key}`} 
                    className="text-xs text-gray-500 dark:text-gray-400 text-center
                      font-medium transition-colors duration-200
                      group-hover:text-indigo-500 dark:group-hover:text-indigo-300"
                  >
                    {day.label}
                  </div>
                ))}
                
                {Array.from({ length: month.startDay }).map((_, i) => (
                  <div 
                    key={`${year}-${month.name}-empty-${i}`} 
                    className="aspect-square"
                  />
                ))}
                
                {month.days.map(day => {
                  const status = getStatusForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`aspect-square text-xs flex items-center justify-center 
                        rounded-sm transition-all duration-200 transform-gpu
                        hover:scale-110 group-hover:shadow-sm
                        ${isToday(day) ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-800 animate-[todayPulse_2s_infinite]' : ''}
                        ${status === 'complete' ? 'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800/50' :
                          status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-800/50' :
                          status === 'missed' ? 'bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800/50' :
                          'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}