/**
 * Calendar Component
 * A modern, animated calendar for medication tracking with enhanced UI/UX
 */

import React, { useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  isToday, getDay, startOfDay, isAfter, isBefore, getWeekOfMonth, 
  addMonths, addYears } from 'date-fns';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { YearlyCalendar } from './YearlyCalendar';
import type { Medication, MedicationLog, CalendarView } from '../types';
import { debug } from '../utils/debug';

interface CalendarProps {
  medications: Medication[];
  logs: MedicationLog[];
  currentDate?: Date;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function Calendar({ medications, logs, currentDate = new Date() }: CalendarProps) {
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [yearRange, setYearRange] = useState({
    start: currentDate.getFullYear(),
    end: currentDate.getFullYear() + 4
  });

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const statusColors = {
    complete: 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/50',
    partial: 'bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-800/50',
    missed: 'bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50',
    none: 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
  };

  const getMedicationsForDay = (day: Date) => {
    const startOfTargetDay = startOfDay(day);
    const weekOfMonth = getWeekOfMonth(day);
    const dayOfWeek = getDay(day);
    const monthIndex = day.getMonth();
    const year = day.getFullYear();
    
    return medications.filter(med => {
      const medStartDate = startOfDay(new Date(med.createdAt));
      
      if (isBefore(startOfTargetDay, medStartDate)) {
        return false;
      }

      if (med.schedule.yearRange) {
        if (year < med.schedule.yearRange.start || year > med.schedule.yearRange.end) {
          return false;
        }
      }

      switch (med.schedule.frequency) {
        case 'daily':
          return true;

        case 'weekly':
          return med.schedule.daysOfWeek?.includes(dayOfWeek);

        case 'monthly':
          const monthMatch = med.schedule.months?.includes(monthIndex);
          if (!monthMatch) return false;

          const weekMatch = med.schedule.weeksOfMonth?.includes(weekOfMonth);
          if (!weekMatch) return false;

          const dayMatch = med.schedule.daysOfMonth?.includes(dayOfWeek);
          return dayMatch;

        default:
          return false;
      }
    });
  };

  const getDayStatus = (day: Date) => {
    const dayMeds = getMedicationsForDay(day);
    if (dayMeds.length === 0) return 'none';

    const dayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), day));
    const takenCount = dayLogs.filter(log => log.status === 'taken').length;

    debug.log('calendar', 'debug', `Day status for ${format(day, 'yyyy-MM-dd')}`, {
      medications: dayMeds.map(m => m.name),
      totalMeds: dayMeds.length,
      takenCount,
      logs: dayLogs
    });

    if (takenCount === dayMeds.length) return 'complete';
    if (takenCount > 0) return 'partial';
    if (isToday(day) || isAfter(day, new Date())) return 'none';
    return 'missed';
  };

  const formatDosage = (medication: Medication) => {
    return `${medication.dosage.amount} ${medication.dosage.unit}${
      medication.dosage.concentration ? ` (${medication.dosage.concentration} IU)` : ''
    }`;
  };

  const handleViewChange = (newView: CalendarView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 300);
  };

  const handleDateChange = useCallback((amount: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (view === 'month') {
        setSelectedDate(prev => addMonths(prev, amount));
      } else if (view === 'year') {
        setSelectedDate(prev => addYears(prev, amount));
      } else {
        setYearRange(prev => ({
          start: prev.start + (amount * 5),
          end: prev.end + (amount * 5)
        }));
      }
      setIsTransitioning(false);
    }, 300);
  }, [view]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border 
      border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 
      overflow-x-auto transition-all duration-300 ease-in-out
      hover:shadow-lg transform-gpu animate-[fadeIn_0.3s_ease-out]">
      
      {/* Improved header layout with fixed spacing */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex-1 flex items-center justify-start">
          <div className="flex items-center">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                rounded-full text-gray-500 dark:text-gray-400 
                transition-all duration-200 hover:scale-110 
                active:scale-95 focus:outline-none focus:ring-2 
                focus:ring-indigo-500 dark:focus:ring-indigo-400
                transform-gpu mr-6"
              aria-label="Previous period"
            >
              <ChevronLeft className="h-5 w-5 transition-transform duration-200 
                hover:-translate-x-0.5" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white
              transition-all duration-300 transform-gpu group min-w-[200px]
              text-center">
              <span className="inline-block group-hover:scale-105 group-hover:text-indigo-600 
                dark:group-hover:text-indigo-400 transition-all">
                {view === 'month' && format(selectedDate, 'MMMM yyyy')}
                {view === 'year' && format(selectedDate, 'yyyy')}
                {view === 'multi-year' && `${yearRange.start} - ${yearRange.end}`}
              </span>
            </h2>

            <button
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                rounded-full text-gray-500 dark:text-gray-400 
                transition-all duration-200 hover:scale-110 
                active:scale-95 focus:outline-none focus:ring-2 
                focus:ring-indigo-500 dark:focus:ring-indigo-400
                transform-gpu ml-6"
              aria-label="Next period"
            >
              <ChevronRight className="h-5 w-5 transition-transform duration-200 
                hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end">
          <div className="relative inline-block">
            <select
              value={view}
              onChange={(e) => handleViewChange(e.target.value as CalendarView)}
              className="appearance-none rounded-md border border-gray-300 dark:border-gray-600 
                px-4 py-2 pr-8 text-sm font-medium bg-white dark:bg-gray-700 
                text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 
                dark:focus:ring-indigo-400 focus:border-indigo-500 
                dark:focus:border-indigo-400 transition-all duration-200 
                hover:border-indigo-500 dark:hover:border-indigo-400 
                cursor-pointer transform-gpu hover:-translate-y-0.5
                shadow-sm hover:shadow"
            >
              <option value="month">Month View</option>
              <option value="year">Year View</option>
              <option value="multi-year">Multi-Year View</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 
              text-gray-500 dark:text-gray-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out
        ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        
        {view === 'month' ? (
          <div className="min-w-[640px] animate-[slideIn_0.5s_ease-out]">
            <div className="grid grid-cols-7 gap-px">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} 
                  className="p-2 text-center text-xs sm:text-sm 
                    font-medium text-gray-500 dark:text-gray-400
                    transition-colors duration-200
                    hover:text-indigo-600 dark:hover:text-indigo-400
                    animate-[fadeIn_0.3s_ease-out]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {day}
                </div>
              ))}
              
              {Array.from({ length: getDay(monthStart) }).map((_, index) => (
                <div key={`empty-${index}`} 
                  className="p-2 bg-gray-50 dark:bg-gray-800/50 
                    transition-colors duration-200" />
              ))}
              
              {days.map((day, index) => {
                const dayMeds = getMedicationsForDay(day);
                const dayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), day));
                const status = getDayStatus(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 min-h-[70px] sm:min-h-[80px] 
                      ${statusColors[status]}
                      ${isToday(day) ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-800 animate-[todayPulse_2s_infinite]' : ''}
                      transition-all duration-200 transform-gpu hover:scale-[1.02]
                      animate-[fadeIn_0.3s_ease-out]`}
                    style={{ animationDelay: `${(index + 7) * 50}ms` }}
                  >
                    <div className="font-medium text-sm sm:text-base text-gray-900 
                      dark:text-white transition-colors duration-200">
                      {format(day, 'd')}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayMeds.map((med, medIndex) => {
                        const taken = dayLogs.some(log => 
                          log.medicationId === med.id && 
                          log.status === 'taken'
                        );
                        
                        return (
                          <div key={med.id} 
                            className={`animate-[slideIn_0.3s_ease-out]`}
                            style={{ animationDelay: `${medIndex * 100}ms` }}
                          >
                            <div className={`text-xs group transition-all duration-200 
                              ${taken ? 'line-through opacity-75' : ''}`}>
                              <div className="truncate text-gray-900 dark:text-white 
                                group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {med.name}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 truncate
                                group-hover:text-indigo-500 dark:group-hover:text-indigo-300">
                                {formatDosage(med)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <YearlyCalendar
            medications={medications}
            logs={logs}
            year={selectedDate.getFullYear()}
            yearRange={view === 'multi-year' ? yearRange : undefined}
            onYearClick={(year) => {
              setSelectedDate(new Date(year, 0));
              setView('year');
            }}
            onMonthClick={(month) => {
              setSelectedDate(new Date(selectedDate.getFullYear(), month));
              setView('month');
            }}
          />
        )}
      </div>
    </div>
  );
}