import React, { useState, useEffect } from 'react';
import { Clock, Package, Check, X, Edit2, Trash2, Sparkles, Undo2, Calendar } from 'lucide-react';
import { isSameDay, getDay, startOfDay, isAfter, isBefore, getDaysInMonth } from 'date-fns';
import type { Medication } from '../types';

interface MedicationCardProps {
  medication: Medication;
  onTake: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onUndo: (logId: string) => void;
  logs: { id: string; timestamp: string; status: string }[];
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

export function MedicationCard({ medication, onTake, onSkip, onEdit, onDelete, onUndo, logs }: MedicationCardProps) {
  const [isAnimating, setIsAnimating] = useState<'take' | 'skip' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [lastLogId, setLastLogId] = useState<string | null>(null);

  useEffect(() => {
    const todayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), new Date()));
    if (todayLogs.length > 0) {
      const mostRecent = todayLogs.reduce((latest, current) => {
        return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
      });
      setLastLogId(mostRecent.id);
      setShowUndoButton(true);
    } else {
      setLastLogId(null);
      setShowUndoButton(false);
    }
  }, [logs]);

  const isTakenToday = () => {
    return logs.some(log => 
      isSameDay(new Date(log.timestamp), new Date()) && 
      log.status === 'taken'
    );
  };

  const isScheduledForToday = () => {
    const today = new Date();
    const medStartDate = startOfDay(new Date(medication.createdAt));
    const todayStart = startOfDay(today);

    if (isBefore(todayStart, medStartDate)) {
      return false;
    }

    switch (medication.schedule.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return medication.schedule.daysOfWeek?.includes(getDay(today)) ?? false;
      case 'monthly':
        const monthMatch = medication.schedule.months?.includes(today.getMonth());
        const weekMatch = medication.schedule.weeksOfMonth?.includes(Math.ceil(today.getDate() / 7));
        const dayMatch = medication.schedule.daysOfMonth?.includes(getDay(today));
        return monthMatch && weekMatch && dayMatch;
      default:
        return false;
    }
  };

  const getScheduleText = () => {
    switch (medication.schedule.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly on ${medication.schedule.daysOfWeek
          ?.map(day => DAYS_OF_WEEK[day].slice(0, 3))
          .join(', ')}`;
      case 'monthly':
        const months = medication.schedule.months?.map(m => 
          new Date(2024, m).toLocaleString('default', { month: 'short' })
        ).join(', ');
        const weeks = medication.schedule.weeksOfMonth?.map(w => 
          w === 1 ? '1st' : w === 2 ? '2nd' : w === 3 ? '3rd' : '4th'
        ).join(', ');
        const days = medication.schedule.daysOfMonth?.map(d => 
          DAYS_OF_WEEK[d].slice(0, 3)
        ).join(', ');
        return `Monthly on ${weeks} week(s) ${days} in ${months}`;
      default:
        return '';
    }
  };

  const handleAction = async (action: 'take' | 'skip') => {
    if (!isScheduledForToday()) {
      setShowError('This medication is not scheduled for today');
      setTimeout(() => setShowError(null), 3000);
      return;
    }

    setIsAnimating(action);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (action === 'take') {
      onTake(medication.id);
    } else {
      onSkip(medication.id);
    }
    
    setIsAnimating(null);
    setShowUndoButton(true);
  };

  const handleUndo = () => {
    if (lastLogId) {
      onUndo(lastLogId);
      setShowUndoButton(false);
      setLastLogId(null);
    }
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
      isTakenToday() ? 'opacity-75' : ''
    }`}>
      {showError && (
        <div className="fixed bottom-4 left-4 right-4 sm:absolute sm:top-0 sm:left-1/2 sm:bottom-auto 
          sm:transform sm:-translate-x-1/2 sm:-translate-y-full bg-red-100 text-red-800 
          px-4 py-2 rounded-lg shadow-sm animate-fade-in z-50 text-center">
          {showError}
        </div>
      )}

      {isAnimating === 'take' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="relative">
            <Check className="h-16 w-16 text-green-500 animate-checkmark" />
            <Sparkles className="absolute top-0 right-0 h-6 w-6 text-yellow-400 animate-sparkle" />
          </div>
        </div>
      )}

      {isAnimating === 'skip' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <X className="h-16 w-16 text-gray-400 animate-cross" />
        </div>
      )}

      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{medication.name}</h3>
            <p className="text-sm text-gray-500">
              {medication.dosage.amount} {medication.dosage.unit}
              {medication.dosage.concentration > 0 && ` (${medication.dosage.concentration} IU)`}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(medication)}
              className="p-2 text-gray-400 hover:text-gray-500 touch-manipulation"
              aria-label="Edit medication"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:text-red-500 touch-manipulation"
              aria-label="Delete medication"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{getScheduleText()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>at {medication.schedule.times.join(', ')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Package className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{medication.inventory} {medication.dosage.unit}s remaining</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleAction('take')}
            disabled={isAnimating !== null || isTakenToday()}
            className="flex-1 min-w-[80px] inline-flex items-center justify-center px-3 py-2 
              border border-transparent text-sm font-medium rounded-md text-white 
              bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 
              disabled:cursor-not-allowed transition-colors touch-manipulation"
          >
            <Check className="h-4 w-4 mr-1" />
            Take
          </button>
          <button
            onClick={() => handleAction('skip')}
            disabled={isAnimating !== null || isTakenToday()}
            className="flex-1 min-w-[80px] inline-flex items-center justify-center px-3 py-2 
              border border-gray-300 text-sm font-medium rounded-md text-gray-700 
              bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 
              disabled:cursor-not-allowed transition-colors touch-manipulation"
          >
            <X className="h-4 w-4 mr-1" />
            Skip
          </button>
          {showUndoButton && lastLogId && (
            <button
              onClick={handleUndo}
              className="flex-1 min-w-[80px] inline-flex items-center justify-center px-3 py-2 
                border border-gray-300 text-sm font-medium rounded-md text-blue-600 
                bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500 transition-colors 
                animate-fade-in touch-manipulation"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-20">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Delete this medication?</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => onDelete(medication.id)}
                className="px-4 py-2 border border-transparent text-sm font-medium 
                  rounded-md text-white bg-red-600 hover:bg-red-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-red-500 touch-manipulation"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium 
                  rounded-md text-gray-700 bg-white hover:bg-gray-50 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-gray-500 touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}