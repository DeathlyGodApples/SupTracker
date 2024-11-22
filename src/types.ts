export interface Medication {
  id: string;
  name: string;
  dosage: {
    amount: number;
    unit: 'pill' | 'ml' | 'mg';
    concentration: number; // IU value
  };
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    times: string[];
    daysOfWeek?: number[];
    months?: number[];
    weeksOfMonth?: number[];
    daysOfMonth?: number[];
    yearRange?: {
      start: number;
      end: number;
    };
  };
  inventory: number;
  notes?: string;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  timestamp: string;
  status: 'taken' | 'skipped' | 'missed';
}

// Extended NotificationOptions type
export interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean;
  silent?: boolean;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  tag?: string;
  timestamp?: number;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export type ViewMode = 'medications' | 'analytics';
export type CalendarView = 'month' | 'year' | 'multi-year';
