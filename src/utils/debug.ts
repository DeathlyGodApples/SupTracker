type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LogEntry {
  timestamp: string;
  category: string;
  level: LogLevel;
  message: string;
  data?: string;
}

const LOG_COLORS = {
  info: '#2563eb',    // blue
  warn: '#d97706',    // amber
  error: '#dc2626',   // red
  debug: '#4b5563',   // gray
  success: '#059669'  // green
};

class DebugManager {
  private enabled: boolean;
  private maxLogs: number = 1000;
  private maxMemorySnapshots: number = 60; // 1 hour worth at 1 per minute
  private memorySnapshots: Array<{ timestamp: number; usage: number }>;

  constructor() {
    this.enabled = localStorage.getItem('debug') === 'true';
    this.memorySnapshots = [];
    
    if (this.enabled) {
      this.setupPerformanceMonitoring();
      this.setupMemoryMonitoring();
    }
  }

  log(category: string, level: LogLevel, message: string, data?: any) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`;

    // Console output
    console.log(
      `%c[${timestamp}] [${category}] [${level.toUpperCase()}]`,
      style,
      message,
      data || ''
    );

    // Store log entry
    const logEntry: LogEntry = {
      timestamp,
      category,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined
    };

    this.storeLog(logEntry);
  }

  private storeLog(entry: LogEntry) {
    try {
      const logs: LogEntry[] = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs.unshift(entry);
      
      // Keep only the most recent logs
      const trimmedLogs = logs.slice(0, this.maxLogs);
      localStorage.setItem('debug_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to store debug log:', error);
      // Clear logs if storage is full or corrupted
      localStorage.removeItem('debug_logs');
    }
  }

  private setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Only log significant performance entries
            if (entry.duration > 100 || entry.entryType === 'navigation') {
              this.log('performance', 'debug', `Performance entry: ${entry.name}`, {
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime),
                entryType: entry.entryType
              });
            }
          });
        });

        observer.observe({ 
          entryTypes: ['measure', 'resource', 'navigation', 'longtask'] 
        });
      } catch (error) {
        this.log('performance', 'error', 'Failed to setup performance monitoring', error);
      }
    }
  }

  private setupMemoryMonitoring() {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB

        this.memorySnapshots.push({
          timestamp: Date.now(),
          usage
        });

        // Keep only recent snapshots
        if (this.memorySnapshots.length > this.maxMemorySnapshots) {
          this.memorySnapshots.shift();
        }

        // Log warning if memory usage is high
        if (usage > 100) {
          this.log('memory', 'warn', `High memory usage: ${usage}MB`, {
            total: Math.round(memory.totalJSHeapSize / 1048576),
            limit: Math.round(memory.jsHeapSizeLimit / 1048576)
          });
        }
      }
    };

    // Check memory usage every minute
    setInterval(checkMemory, 60000);
    checkMemory(); // Initial check
  }

  enable() {
    this.enabled = true;
    localStorage.setItem('debug', 'true');
    this.setupPerformanceMonitoring();
    this.setupMemoryMonitoring();
  }

  disable() {
    this.enabled = false;
    localStorage.setItem('debug', 'false');
  }

  isEnabled() {
    return this.enabled;
  }

  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('debug_logs') || '[]');
    } catch {
      return [];
    }
  }

  getMemorySnapshots() {
    return [...this.memorySnapshots];
  }

  clearLogs() {
    localStorage.removeItem('debug_logs');
    this.memorySnapshots = [];
  }
}

export const debug = new DebugManager();

// Initialize debug mode from URL parameter if present
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('debug')) {
    debug.enable();
  }
}