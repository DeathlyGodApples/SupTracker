import React, { useState, useEffect } from 'react';
import { debug } from '../utils/debug';
import { Terminal, Activity, Database, Wifi, X } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState(debug.getPerformanceMetrics());
  const [activeTab, setActiveTab] = useState<'logs' | 'network' | 'performance' | 'memory'>('logs');

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(debug.getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'logs':
        return (
          <div className="h-96 overflow-y-auto font-mono text-xs">
            {metrics.logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 border-b border-gray-100 ${
                  log.level === 'error' ? 'bg-red-50' :
                  log.level === 'warn' ? 'bg-yellow-50' :
                  log.level === 'info' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    log.level === 'error' ? 'bg-red-100 text-red-800' :
                    log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                    log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.category}
                  </span>
                </div>
                <div className="mt-1">{log.message}</div>
                {log.data && (
                  <pre className="mt-1 text-gray-600">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
                {log.stackTrace && (
                  <pre className="mt-1 text-red-600 text-xs">
                    {log.stackTrace}
                  </pre>
                )}
              </div>
            ))}
          </div>
        );

      case 'network':
        return (
          <div className="h-96 overflow-y-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Duration</th>
                </tr>
              </thead>
              <tbody>
                {metrics.networkRequests.map(request => (
                  <tr key={request.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-sm">{request.id}</td>
                    <td className="px-4 py-2 text-sm">
                      {request.duration ? formatDuration(request.duration) : 'Pending...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'performance':
        return (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Uptime</h3>
              <p className="text-2xl font-semibold">
                {formatDuration(metrics.uptime)}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Network Requests</h3>
              <p className="text-2xl font-semibold">
                {metrics.networkRequests.length} total
              </p>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="h-96">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700">Current Memory Usage</h3>
              <p className="text-2xl font-semibold">
                {formatBytes(metrics.memoryUsage[metrics.memoryUsage.length - 1]?.usage || 0)}
              </p>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700"
      >
        <Terminal className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Debug Panel</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'logs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
          }`}
        >
          <Terminal className="h-4 w-4 inline-block mr-1" />
          Logs
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'network' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
          }`}
        >
          <Wifi className="h-4 w-4 inline-block mr-1" />
          Network
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'performance' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
          }`}
        >
          <Activity className="h-4 w-4 inline-block mr-1" />
          Performance
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'memory' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
          }`}
        >
          <Database className="h-4 w-4 inline-block mr-1" />
          Memory
        </button>
      </div>

      {renderContent()}

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => debug.clearLogs()}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}