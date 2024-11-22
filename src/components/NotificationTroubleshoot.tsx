import React from 'react';
import { AlertCircle, CheckCircle, Settings, Smartphone, Globe, Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationTroubleshoot() {
  const { permission, checkNotificationSupport } = useNotifications();
  const issues = checkNotificationSupport();

  const troubleshootingSteps = [
    {
      title: 'Check Browser Compatibility',
      icon: Globe,
      steps: [
        'Use a modern browser like Chrome, Firefox, Safari, or Edge',
        'Ensure your browser is up to date',
        'Try using a different browser if issues persist'
      ]
    },
    {
      title: 'Browser Settings',
      icon: Settings,
      steps: [
        'Open browser settings',
        'Search for "notifications" or "permissions"',
        'Ensure MedTracker is allowed to send notifications',
        'Check if notifications are blocked for all sites'
      ]
    },
    {
      title: 'Mobile Device Settings',
      icon: Smartphone,
      steps: [
        'Open device Settings',
        'Go to Notifications',
        'Find your browser in the app list',
        'Enable notifications for the browser',
        'For iOS: Enable "Allow Notifications" in Safari settings'
      ]
    },
    {
      title: 'App-Specific Checks',
      icon: Bell,
      steps: [
        'Refresh the page',
        'Click "Enable Notifications" button again',
        'Check if you\'re using the latest version of the app',
        'Clear browser cache and cookies if needed'
      ]
    }
  ];

  if (permission === 'granted' && issues.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto my-8">
      <div className="flex items-center space-x-3 mb-6">
        <AlertCircle className="h-6 w-6 text-amber-500" />
        <h2 className="text-lg font-semibold text-gray-900">
          Notification Troubleshooting Guide
        </h2>
      </div>

      {issues.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Detected Issues:
          </h3>
          <ul className="list-disc list-inside text-sm text-red-700">
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {troubleshootingSteps.map((section, index) => (
          <div key={index} className="border-t border-gray-200 pt-4 first:border-0 first:pt-0">
            <div className="flex items-center space-x-3 mb-3">
              <section.icon className="h-5 w-5 text-indigo-500" />
              <h3 className="text-base font-medium text-gray-900">
                {section.title}
              </h3>
            </div>
            <ol className="list-decimal list-inside space-y-2">
              {section.steps.map((step, stepIndex) => (
                <li key={stepIndex} className="text-sm text-gray-600 pl-4">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Still having issues?
            </h4>
            <div className="text-sm text-blue-700">
              If you've followed all steps and notifications still don't work, it might be due to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Device-specific restrictions</li>
                <li>Corporate/network policies</li>
                <li>Privacy settings in your operating system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}