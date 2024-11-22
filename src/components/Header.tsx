/**
 * Header Component
 * 
 * A modern, responsive header with smooth animations and transitions.
 * Features include:
 * - Responsive design with mobile navigation
 * - Dark mode toggle
 * - Notification permissions handling
 * - Smooth transitions and hover effects
 * - Accessible button states
 */

import { Bell, Bug, Moon, Sun, Pill } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useDarkMode } from '../hooks/useDarkMode';
import type { ViewMode } from '../types';
import { debug } from '../utils/debug';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onAddMedication: () => void;
}

// Predefined medication options for the application
const MEDICATIONS = [
  { value: 'Iron', label: 'Iron' },
  { value: 'Vitamin D', label: 'Vitamin D' },
  { value: 'B12', label: 'B12' },
  { value: 'Magnesium', label: 'Magnesium' },
  { value: 'Zinc', label: 'Zinc' }
];

// Days of the week for scheduling
const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Months for scheduling
const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

// Weeks of the month for scheduling
const WEEKS = [
  { value: 1, label: 'First Week' },
  { value: 2, label: 'Second Week' },
  { value: 3, label: 'Third Week' },
  { value: 4, label: 'Fourth Week' },
];

export function Header({ viewMode, setViewMode, onAddMedication }: HeaderProps) {
  // Hooks for notifications and dark mode
  const { 
    permission, 
    requestPermission, 
    notificationError, 
    testNotification 
  } = useNotifications();
  const [isDark, setIsDark] = useDarkMode();

  // Handler for requesting notification permissions
  const handleRequestPermission = async () => {
    debug.log('header', 'info', 'Requesting notification permission');
    try {
      const granted = await requestPermission();
      debug.log('header', 'info', `Permission request result: ${granted ? 'granted' : 'denied'}`);
    } catch (error) {
      debug.log('header', 'error', 'Failed to request notification permission', error);
    }
  };

  // Handler for testing notifications
  const handleTestNotification = async () => {
    debug.log('header', 'info', 'Testing notification');
    try {
      const result = await testNotification();
      debug.log('header', 'info', `Test notification result: ${result ? 'success' : 'failed'}`);
    } catch (error) {
      debug.log('header', 'error', 'Test notification failed', error);
    }
  };

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-gray-800/90 border-b border-gray-200 
      dark:border-gray-700 z-50 backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left section: Logo and brand */}
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0 group">
              {/* Logo with hover rotation effect */}
              <Pill className="h-8 w-8 text-indigo-600 dark:text-indigo-500 
                transition-transform duration-300 ease-out 
                group-hover:rotate-12" />
              <h1 className="ml-2.5 text-xl font-semibold text-gray-900 dark:text-white 
                hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                MedTracker
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex space-x-1">
              {/* Navigation buttons with active states and hover effects */}
              <button
                onClick={() => setViewMode('medications')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 
                  ${viewMode === 'medications'
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                Medications
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 
                  ${viewMode === 'analytics'
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {/* Right section: Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Notification permission button */}
            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="inline-flex items-center px-3 py-1.5 border border-transparent 
                  text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-400 
                  bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 
                  dark:hover:bg-indigo-900/70 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 
                  transition-all duration-200 hover:-translate-y-0.5"
                title={notificationError || 'Enable notifications for medication reminders'}
              >
                <Bell className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Enable Notifications</span>
              </button>
            )}

            {/* Test notification button */}
            {permission === 'granted' && (
              <button
                onClick={handleTestNotification}
                className="inline-flex items-center px-3 py-1.5 border border-transparent 
                  text-sm font-medium rounded-md text-green-700 dark:text-green-400 
                  bg-green-50 dark:bg-green-900/50 hover:bg-green-100 
                  dark:hover:bg-green-900/70 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 
                  transition-all duration-200 hover:-translate-y-0.5"
                title="Test notifications"
              >
                <Bug className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Test</span>
              </button>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent 
                text-sm font-medium rounded-md bg-gray-50 dark:bg-gray-700 
                text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 
                transition-all duration-200 hover:-translate-y-0.5"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:mr-1.5 transition-transform duration-300" />
              ) : (
                <Moon className="h-4 w-4 sm:mr-1.5 transition-transform duration-300" />
              )}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Add medication button */}
            <button
              onClick={onAddMedication}
              className="inline-flex items-center px-4 py-2 border border-transparent 
                text-sm font-medium rounded-md text-white bg-indigo-600 
                hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-indigo-500 dark:focus:ring-offset-gray-800 
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              Add Medication
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setViewMode('medications')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium 
                transition-all duration-200 ${
                viewMode === 'medications'
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              Medications
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium 
                transition-all duration-200 ${
                viewMode === 'analytics'
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}