import { Bell, Bug, Pill } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import type { ViewMode } from '../types';
import { debug } from '../utils/debug';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onAddMedication: () => void;
}

export function Header({ viewMode, setViewMode, onAddMedication }: HeaderProps) {
  const { 
    permission, 
    requestPermission, 
    notificationError, 
    testNotification 
  } = useNotifications();

  const handleRequestPermission = async () => {
    debug.log('header', 'info', 'Requesting notification permission');
    try {
      const granted = await requestPermission();
      debug.log('header', 'info', `Permission request result: ${granted ? 'granted' : 'denied'}`);
    } catch (error) {
      debug.log('header', 'error', 'Failed to request notification permission', error);
    }
  };

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
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:h-16 gap-4">
          <div className="flex w-full sm:w-auto justify-between items-center">
            <div className="flex items-center">
              <Pill className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
              <h1 className="ml-2 text-lg sm:text-xl font-semibold text-gray-900">
                MedTracker
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent 
                    text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 
                    hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500 transition-colors duration-200"
                  title={notificationError || 'Enable notifications for medication reminders'}
                >
                  <Bell className="h-4 w-4 mr-1.5" />
                  Enable Notifications
                </button>
              )}

              {permission === 'granted' && (
                <button
                  onClick={handleTestNotification}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent 
                    text-sm font-medium rounded-md text-green-700 bg-green-50 
                    hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-green-500 transition-colors duration-200"
                  title="Test notifications"
                >
                  <Bug className="h-4 w-4 mr-1.5" />
                  Test
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <button
                onClick={() => setViewMode('medications')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'medications'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Medications
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'analytics'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </nav>

            <button
              onClick={onAddMedication}
              className="inline-flex items-center px-4 py-2 border border-transparent 
                text-sm font-medium rounded-md text-white bg-indigo-600 
                hover:bg-indigo-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Medication
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}