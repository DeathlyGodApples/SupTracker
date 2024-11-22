import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, startOfDay, isAfter, isBefore, getWeekOfMonth, addMonths, addYears } from 'date-fns';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { YearlyCalendar } from './YearlyCalendar';
import type { Medication, MedicationLog, CalendarView } from '../types';
import { debug } from '../utils/debug';

interface CalendarProps {
  medications: Medication[];
  logs: MedicationLog[];
  currentDate?: Date;
}

export function Calendar({ medications, logs, currentDate = new Date() }: CalendarProps) {
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [yearRange, setYearRange] = useState({
    start: currentDate.getFullYear(),
    end: currentDate.getFullYear() + 4
  });

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const statusColors = {
    complete: 'bg-green-100',
    partial: 'bg-yellow-100',
    missed: 'bg-red-100',
    none: 'bg-gray-50'
  };

  const getMedicationsForDay = (day: Date) => {
    const startOfTargetDay = startOfDay(day);
    const weekOfMonth = getWeekOfMonth(day);
    const dayOfWeek = getDay(day);
    const monthIndex = day.getMonth();
    const year = day.getFullYear();
    
    return medications.filter(med => {
      const medStartDate = startOfDay(new Date(med.createdAt));
      
      // Skip if medication hasn't started yet
      if (isBefore(startOfTargetDay, medStartDate)) {
        return false;
      }

      // Check year range if specified
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
    setView(newView);
  };

  const handleDateChange = (amount: number) => {
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
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {view === 'month' && format(selectedDate, 'MMMM yyyy')}
            {view === 'year' && format(selectedDate, 'yyyy')}
            {view === 'multi-year' && `${yearRange.start} - ${yearRange.end}`}
          </h2>

          <button
            onClick={() => handleDateChange(1)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={view}
            onChange={(e) => handleViewChange(e.target.value as CalendarView)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="multi-year">Multi-Year</option>
          </select>
        </div>
      </div>

      {view === 'month' ? (
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {Array.from({ length: getDay(monthStart) }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2 bg-gray-50" />
            ))}
            
            {days.map(day => {
              const dayMeds = getMedicationsForDay(day);
              const dayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), day));
              const status = getDayStatus(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 min-h-[70px] sm:min-h-[80px] ${statusColors[status]} ${
                    isToday(day) ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base">{format(day, 'd')}</div>
                  <div className="mt-1 space-y-1">
                    {dayMeds.map(med => {
                      const taken = dayLogs.some(log => 
                        log.medicationId === med.id && 
                        log.status === 'taken'
                      );
                      
                      return (
                        <div key={med.id}>
                          <div className={`text-xs ${taken ? 'line-through opacity-75' : ''}`}>
                            <div className="truncate">{med.name}</div>
                            <div className="text-gray-500 truncate">
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
  );
}