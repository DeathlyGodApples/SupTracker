import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, getMonth, eachMonthOfInterval } from 'date-fns';
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

export function YearlyCalendar({ medications, logs, year, yearRange, onYearClick, onMonthClick }: YearlyCalendarProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-scale-in">
      {years.map(year => (
        <React.Fragment key={year}>
          {getMonthsForYear(year).map((month, index) => (
            <div
              key={`${year}-${month.name}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md 
                transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (yearRange && onYearClick) {
                  onYearClick(year);
                } else {
                  onMonthClick(index);
                }
              }}
            >
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                {yearRange ? `${month.name} ${year}` : month.name}
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_HEADERS.map(day => (
                  <div key={`${year}-${month.name}-${day.key}`} className="text-xs text-gray-500 text-center">
                    {day.label}
                  </div>
                ))}
                
                {Array.from({ length: month.startDay }).map((_, i) => (
                  <div key={`${year}-${month.name}-empty-${i}`} className="aspect-square" />
                ))}
                
                {month.days.map(day => {
                  const status = getStatusForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`aspect-square text-xs flex items-center justify-center rounded-sm
                        ${isToday(day) ? 'ring-1 ring-blue-500' : ''}
                        ${status === 'complete' ? 'bg-green-100' :
                          status === 'partial' ? 'bg-yellow-100' :
                          status === 'missed' ? 'bg-red-100' :
                          'bg-gray-50'}`}
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