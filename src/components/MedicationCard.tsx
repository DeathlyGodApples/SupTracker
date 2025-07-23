/**
 * MedicationCard Component
 * 
 * A modern, animated card component for displaying medication information.
 * Features include:
 * - Smooth entry animations
 * - Interactive hover effects
 * - Action confirmation animations
 * - Responsive design
 * - Accessibility features
 */

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
  logs: { id: string; timestamp: string; status: string; medication_id?: string }[];
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

export function MedicationCard({ 
  medication, 
  onTake, 
  onSkip, 
  onEdit, 
  onDelete, 
  onUndo, 
  logs 
}: MedicationCardProps) {
  const [isAnimating, setIsAnimating] = useState<'take' | 'skip' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [lastLogId, setLastLogId] = useState<string | null>(null);

  // Handle logs and undo button visibility
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

  // Check if medication was taken today
  const isTakenToday = () => {
    return logs.some(log => 
      isSameDay(new Date(log.timestamp), new Date()) && 
      log.status === 'taken'
    );
  };

  // Verify if medication is scheduled for today
  const isScheduledForToday = () => {
    const today = new Date();
    const medStartDate = startOfDay(new Date(medication.created_at));
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

  // Generate schedule display text
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

  // Handle take/skip actions with animations
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

  // Handle undo action
  const handleUndo = () => {
    if (lastLogId) {
      onUndo(lastLogId);
      setShowUndoButton(false);
      setLastLogId(null);
    }
  };

  return (
    // Main card container with entry animation and hover effects
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-sm 
      border border-gray-200 dark:border-gray-700 p-4 
      hover:shadow-md transition-all duration-300 ease-in-out
      animate-[slideIn_0.3s_ease-out] hover:scale-[1.02]
      ${isTakenToday() ? 'opacity-75' : ''}`}>
      
      {/* Error message with slide and fade animations */}
      {showError && (
        <div className="fixed bottom-4 left-4 right-4 sm:absolute sm:top-0 sm:left-1/2 
          sm:bottom-auto sm:transform sm:-translate-x-1/2 sm:-translate-y-full 
          bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 
          px-4 py-2 rounded-lg shadow-sm animate-[slideIn_0.3s_ease-out] z-50 text-center">
          {showError}
        </div>
      )}

      {/* Take action animation overlay */}
      {isAnimating === 'take' && (
        <div className="absolute inset-0 flex items-center justify-center 
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10
          animate-[fadeIn_0.3s_ease-out]">
          <div className="relative">
            <Check className="h-16 w-16 text-green-500 dark:text-green-400 
              animate-[checkmark_0.5s_ease-out]" />
            <Sparkles className="absolute top-0 right-0 h-6 w-6 text-yellow-400 
              animate-[sparkle_0.8s_ease-out]" />
          </div>
        </div>
      )}

      {/* Skip action animation overlay */}
      {isAnimating === 'skip' && (
        <div className="absolute inset-0 flex items-center justify-center 
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10
          animate-[fadeIn_0.3s_ease-out]">
          <X className="h-16 w-16 text-gray-400 dark:text-gray-500 
            animate-[shake_0.5s_ease-in-out]" />
        </div>
      )}

      {/* Main content with fade transition */}
      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header section */}
        <div className="flex justify-between items-start mb-4">
          <div className="group">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white
              group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {medication.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors
              group-hover:text-gray-700 dark:group-hover:text-gray-300">
              {medication.dosage.amount} {medication.dosage.unit}
              {medication.dosage.concentration > 0 && ` (${medication.dosage.concentration} IU)`}
            </p>
          </div>

          {/* Action buttons with hover animations */}
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(medication)}
              className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 
                dark:hover:text-gray-400 transition-all duration-200
                hover:-translate-y-0.5 hover:scale-110"
              aria-label="Edit medication"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:text-red-500 dark:text-red-500 
                dark:hover:text-red-400 transition-all duration-200
                hover:-translate-y-0.5 hover:scale-110"
              aria-label="Delete medication"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Medication details with hover effects */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400
            hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
            group cursor-default">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0 
              group-hover:animate-[pulse_1s_ease-in-out_infinite]" />
            <span className="truncate">{getScheduleText()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400
            hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
            group cursor-default">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0 
              group-hover:animate-[pulse_1s_ease-in-out_infinite]" />
            <span>at {medication.schedule.times.join(', ')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400
            hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
            group cursor-default">
            <Package className="h-4 w-4 mr-2 flex-shrink-0 
              group-hover:animate-[pulse_1s_ease-in-out_infinite]" />
            <span>{medication.inventory} {medication.dosage.unit}s remaining</span>
          </div>
        </div>

        {/* Action buttons with animations */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleAction('take')}
            disabled={isAnimating !== null || isTakenToday()}
            className="flex-1 min-w-[80px] inline-flex items-center justify-center px-3 py-2 
              border border-transparent text-sm font-medium rounded-md text-white 
              bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-green-500 dark:focus:ring-green-400
              dark:focus:ring-offset-gray-800 disabled:opacity-50 
              disabled:cursor-not-allowed transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md active:translate-y-0
              transform-gpu"
          >
            <Check className="h-4 w-4 mr-1 group-hover:animate-pulse" />
            Take
          </button>
          <button
            onClick={() => handleAction('skip')}
            disabled={isAnimating !== null || isTakenToday()}
            className="flex-1 min-w-[80px] inline-flex items-center justify-center px-3 py-2 
              border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md 
              text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
              hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
              dark:focus:ring-offset-gray-800 disabled:opacity-50 
              disabled:cursor-not-allowed transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md active:translate-y-0
              transform-gpu"
          >
            <X className="h-4 w-4 mr-1" />
            Skip
          </button>
          {showUndoButton && lastLogId && (
            <button
              onClick={handleUndo}
              className="flex-1 min-w-[80px] inline-flex items-center justify-center px-3 py-2 
                border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md 
                text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 
                hover:bg-blue-100 dark:hover:bg-blue-900/70 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400
                dark:focus:ring-offset-gray-800 transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-md
                animate-[slideIn_0.3s_ease-out]"
            >
              <Undo2 className="h-4 w-4 mr-1 animate-[pulse_2s_ease-in-out_infinite]" />
              Undo
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog with animations */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 
          backdrop-blur-sm flex items-center justify-center p-4 z-20
          animate-[fadeIn_0.2s_ease-out]">
          <div className="text-center transform-gpu animate-[slideIn_0.3s_ease-out]">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Delete this medication?
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => onDelete(medication.id)}
                className="px-4 py-2 border border-transparent text-sm font-medium 
                  rounded-md text-white bg-red-600 dark:bg-red-500 
                  hover:bg-red-700 dark:hover:bg-red-600 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-red-500 dark:focus:ring-red-400
                  dark:focus:ring-offset-gray-800 transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-md active:translate-y-0
                  transform-gpu"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                  text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 
                  bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-gray-500 dark:focus:ring-gray-400
                  dark:focus:ring-offset-gray-800 transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-md active:translate-y-0
                  transform-gpu"
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