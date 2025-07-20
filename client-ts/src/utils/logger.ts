/**
 * Advanced TypeScript Logger
 * Structured logging with type safety and performance optimization
 */

import type { LogLevel, LogEntry, LoggerOptions } from '@/types';
import config from '@/config/app.config';

export class Logger {
  private readonly context: string;
  private readonly levels: Record<LogLevel, number>;
  private readonly currentLevel: number;
  private readonly enableLogging: boolean;
  private readonly maxLogs: number = 100;

  constructor(context = 'App', options: LoggerOptions = {}) {
    this.context = context;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    this.currentLevel = this.levels[options.logLevel ?? config.development.logLevel] ?? this.levels.info;
    this.enableLogging = options.enableLogging ?? config.development.enableLogging;
  }

  /**
   * Internal logging method with type safety
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.enableLogging || this.levels[level] < this.currentLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      data
    };

    // Console output with styled formatting
    this.outputToConsole(logEntry);
    
    // Store in session storage for debugging
    this.storeLog(logEntry);
  }

  /**
   * Output formatted log to console
   */
  private outputToConsole(entry: LogEntry): void {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #6c757d; font-weight: normal;',
      info: 'color: #0dcaf0; font-weight: normal;',
      warn: 'color: #ffc107; font-weight: bold;',
      error: 'color: #dc3545; font-weight: bold;'
    };

    const prefix = `%c[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}]`;
    const style = styles[entry.level];

    if (entry.data !== undefined) {
      console[entry.level](prefix, style, entry.message, entry.data);
    } else {
      console[entry.level](prefix, style, entry.message);
    }
  }

  /**
   * Store log entry in session storage
   */
  private storeLog(entry: LogEntry): void {
    try {
      const logs = this.getLogs();
      logs.push(entry);
      
      // Keep only recent logs
      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs);
      }
      
      sessionStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Ignore storage errors to prevent infinite loops
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * Error level logging
   */
  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  /**
   * Create child logger with extended context
   */
  child(additionalContext: string): Logger {
    return new Logger(`${this.context}:${additionalContext}`, {
      enableLogging: this.enableLogging,
      logLevel: Object.keys(this.levels)[this.currentLevel] as LogLevel
    });
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    try {
      const logs = sessionStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.getLogs().filter(log => log.level === level);
  }

  /**
   * Get logs filtered by context
   */
  getLogsByContext(context: string): LogEntry[] {
    return this.getLogs().filter(log => log.context.includes(context));
  }

  /**
   * Get logs within time range
   */
  getLogsByTimeRange(startTime: Date, endTime: Date): LogEntry[] {
    const start = startTime.getTime();
    const end = endTime.getTime();
    
    return this.getLogs().filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    sessionStorage.removeItem('app_logs');
    this.info('Logs cleared');
  }

  /**
   * Export logs as downloadable JSON file
   */
  exportLogs(): void {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.info('Logs exported successfully');
  }

  /**
   * Get logging statistics
   */
  getStats(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    oldestLog?: string;
    newestLog?: string;
    contextsCount: number;
  } {
    const logs = this.getLogs();
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0
    };

    const contexts = new Set<string>();

    logs.forEach(log => {
      logsByLevel[log.level]++;
      contexts.add(log.context);
    });

    return {
      totalLogs: logs.length,
      logsByLevel,
      oldestLog: logs[0]?.timestamp,
      newestLog: logs[logs.length - 1]?.timestamp,
      contextsCount: contexts.size
    };
  }

  /**
   * Performance timing helper
   */
  time(label: string): () => void {
    const startTime = performance.now();
    this.debug(`Timer started: ${label}`);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.debug(`Timer ended: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  /**
   * Async operation wrapper with logging
   */
  async logAsync<T>(
    operation: () => Promise<T>,
    operationName: string,
    logData?: unknown
  ): Promise<T> {
    const endTimer = this.time(operationName);
    
    try {
      this.debug(`Starting async operation: ${operationName}`, logData);
      const result = await operation();
      this.debug(`Completed async operation: ${operationName}`);
      return result;
    } catch (error) {
      this.error(`Failed async operation: ${operationName}`, { error, data: logData });
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Error boundary wrapper
   */
  wrapError<T extends unknown[], R>(
    fn: (...args: T) => R,
    context: string
  ): (...args: T) => R | undefined {
    return (...args: T) => {
      try {
        return fn(...args);
      } catch (error) {
        this.error(`Error in ${context}`, { error, args });
        return undefined;
      }
    };
  }

  /**
   * Conditional logging based on condition
   */
  logIf(condition: boolean, level: LogLevel, message: string, data?: unknown): void {
    if (condition) {
      this.log(level, message, data);
    }
  }

  /**
   * Log with custom formatting
   */
  logFormatted(level: LogLevel, template: string, values: Record<string, unknown>): void {
    let message = template;
    Object.entries(values).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    this.log(level, message, values);
  }
}

// Create default logger instance
export const logger = new Logger('DenounceBeasts');

// Export logger factory
export const createLogger = (context: string, options?: LoggerOptions): Logger => {
  return new Logger(context, options);
};

// Performance monitoring helper
export const performanceLogger = logger.child('Performance');

// Error tracking helper
export const errorLogger = logger.child('ErrorTracking');

// API request logger
export const apiLogger = logger.child('API');

// UI event logger
export const uiLogger = logger.child('UI');

export default logger;