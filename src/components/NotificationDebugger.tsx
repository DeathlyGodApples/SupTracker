import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Clock, History, Volume2, VolumeX, Calendar, Smartphone } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationLog {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  status: 'success' | 'error';
  error?: string;
}

interface PWAStatus {
  installed: boolean;
  standalone: boolean;
  icons: {
    path: string;
    loaded: boolean;
    error?: string;
  }[];
}

export function NotificationDebugger() {
  const { permission, notificationError, requestPermission, scheduledNotifications } = useNotifications();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    installed: false,
    standalone: false,
    icons: [
      { path: '/icon-192.png', loaded: false },
      { path: '/icon-512.png', loaded: false }
    ]
  });

  // Check PWA installation status
  useEffect(() => {
    const checkPWAStatus = async () => {
      // Check if running as standalone PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone || 
                          document.referrer.includes('android-app://');

      // Check if installed
      let isInstalled = false;
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const apps = await (navigator as any).getInstalledRelatedApps();
          isInstalled = apps.length > 0;
        } catch (error) {
          console.warn('Failed to check installed apps:', error);
        }
      }

      // Check icon loading
      const checkIcon = async (path: string) => {
        try {
          const response = await fetch(path);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          if (!blob.type.startsWith('image/')) {
            throw new Error('Not an image file');
          }
          return { path, loaded: true };
        } catch (error) {
          return { 
            path, 
            loaded: false, 
            error: error instanceof Error ? error.message : 'Failed to load icon'
          };
        }
      };

      const iconStatuses = await Promise.all(
        pwaStatus.icons.map(icon => checkIcon(icon.path))
      );

      setPwaStatus({
        installed: isInstalled,
        standalone: isStandalone,
        icons: iconStatuses
      });
    };

    checkPWAStatus();
  }, []);

  const renderPWAStatus = () => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-2">PWA Status</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Running as PWA:</span>
          <span className={pwaStatus.standalone ? 'text-green-600' : 'text-gray-600'}>
            {pwaStatus.standalone ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Installed:</span>
          <span className={pwaStatus.installed ? 'text-green-600' : 'text-gray-600'}>
            {pwaStatus.installed ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="mt-2">
          <span className="block mb-1">Icons:</span>
          {pwaStatus.icons.map(icon => (
            <div key={icon.path} className="flex items-center text-xs mt-1">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                icon.loaded ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="flex-1">{icon.path}</span>
              {icon.error && (
                <span className="text-red-500 ml-2" title={icon.error}>
                  <AlertCircle className="w-4 h-4" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Status</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowScheduled(!showScheduled)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Scheduled Notifications"
            >
              <Calendar className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Notification History"
            >
              <History className="h-5 w-5" />
            </button>
          </div>
        </div>

        {renderPWAStatus()}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Notification Permission:</span>
            <div className={`flex items-center ${
              permission === 'granted' ? 'text-green-600' : 
              permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {permission === 'granted' ? <CheckCircle className="h-5 w-5" /> :
               permission === 'denied' ? <AlertCircle className="h-5 w-5" /> :
               <Clock className="h-5 w-5" />}
              <span className="ml-2 text-sm font-medium">{permission}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Platform:</span>
            <span className="text-sm font-medium">
              {/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' :
               /Android/.test(navigator.userAgent) ? 'Android' : 'Desktop'}
            </span>
          </div>

          {notificationError && (
            <div className="p-2 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{notificationError}</p>
            </div>
          )}

          {showScheduled && scheduledNotifications.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Scheduled Notifications ({scheduledNotifications.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {scheduledNotifications.map(notification => (
                  <div key={notification.id} 
                    className="p-2 bg-blue-50 rounded-md text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">
                        {new Date(notification.scheduledTime).toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-blue-600">
                        {notification.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showHistory && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Recent Activity
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {logs.map(log => (
                  <div key={log.id} 
                    className={`p-2 rounded-md text-sm ${
                      log.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className={log.status === 'success' ? 
                        'text-green-700' : 'text-red-700'}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.status === 'success' ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <AlertCircle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="mt-1">
                      <div className="font-medium">{log.title}</div>
                      <div className="text-gray-600">{log.body}</div>
                      {log.error && (
                        <div className="text-red-600 text-xs mt-1">{log.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}