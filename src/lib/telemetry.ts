/**
 * Local Privacy-First Telemetry Logger
 * 
 * Records performance and failure metrics locally (Console & LocalStorage).
 * Designed to capture WebCodecs fallbacks and export funnel drops.
 */

export type TelemetryEvent = 
  | 'EXPORT_STARTED' 
  | 'EXPORT_COMPLETED' 
  | 'EXPORT_CANCELLED' 
  | 'WEBCODECS_FALLBACK';

export interface TelemetryData {
  event: TelemetryEvent;
  timestamp: number;
  durationMs?: number;
  metadata?: Record<string, any>;
}

class TelemetryLogger {
  private static instance: TelemetryLogger;
  private logs: TelemetryData[] = [];
  private readonly STORAGE_KEY = 'pelimotion_telemetry_logs';

  private constructor() {
    this.loadLogs();
  }

  public static getInstance(): TelemetryLogger {
    if (!TelemetryLogger.instance) {
      TelemetryLogger.instance = new TelemetryLogger();
    }
    return TelemetryLogger.instance;
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Telemetry: failed to load logs from localStorage');
    }
  }

  private saveLogs() {
    try {
      // Keep only the last 100 events to prevent bloat
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(-100);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Telemetry: failed to save logs to localStorage');
    }
  }

  public logEvent(event: TelemetryEvent, metadata?: Record<string, any>, durationMs?: number) {
    const data: TelemetryData = {
      event,
      timestamp: Date.now(),
      metadata,
      durationMs,
    };
    
    this.logs.push(data);
    this.saveLogs();

    // Silent logging for debug in dev
    if (import.meta.env.DEV) {
      console.debug(`[Telemetry] ${event}`, data);
    }
  }
}

export const Telemetry = TelemetryLogger.getInstance();
