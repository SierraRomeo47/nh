/**
 * Centralized Logging Service
 * Provides structured logging with context, error tracking, and severity levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogContext {
  userId?: string;
  userRole?: string;
  component?: string;
  action?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: LogContext;
  stack?: string;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;
  private errorListeners: Array<(entry: LogEntry) => void> = [];

  /**
   * Get current user context from localStorage or window
   */
  private getContext(): LogContext {
    const context: LogContext = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        context.userId = user.id;
        context.userRole = user.role;
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return context;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    additionalContext?: LogContext
  ): LogEntry {
    const context = {
      ...this.getContext(),
      ...additionalContext,
    };

    return {
      level,
      message,
      error,
      context,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Store log entry in history
   */
  private storeLog(entry: LogEntry) {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Notify error listeners for errors
    if (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL) {
      this.errorListeners.forEach(listener => {
        try {
          listener(entry);
        } catch (e) {
          // Prevent listener errors from breaking logging
          console.error('Error in log listener:', e);
        }
      });
    }
  }

  /**
   * Format log entry for console output
   */
  private formatForConsole(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level}]`,
      entry.message,
    ];

    if (entry.context?.component) {
      parts.push(`[${entry.context.component}]`);
    }

    if (entry.context?.action) {
      parts.push(`[${entry.context.action}]`);
    }

    return parts.join(' ');
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, undefined, context);
    this.storeLog(entry);
    
    if (this.isDevelopment) {
      console.debug(this.formatForConsole(entry), entry.context);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    const entry = this.createLogEntry(LogLevel.INFO, message, undefined, context);
    this.storeLog(entry);
    
    if (this.isDevelopment) {
      console.info(this.formatForConsole(entry), entry.context);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, error?: Error, context?: LogContext) {
    const entry = this.createLogEntry(LogLevel.WARN, message, error, context);
    this.storeLog(entry);
    
    console.warn(this.formatForConsole(entry), entry.context, error);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, error, context);
    this.storeLog(entry);
    
    console.error(this.formatForConsole(entry), {
      error,
      context: entry.context,
      stack: entry.stack,
    });

    // In production, could send to error tracking service
    this.reportError(entry);
  }

  /**
   * Log critical error
   */
  critical(message: string, error?: Error, context?: LogContext) {
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, error, context);
    this.storeLog(entry);
    
    console.error(`🚨 CRITICAL: ${this.formatForConsole(entry)}`, {
      error,
      context: entry.context,
      stack: entry.stack,
    });

    // Always report critical errors
    this.reportError(entry, true);
  }

  /**
   * Report error to external service (e.g., Sentry, LogRocket)
   */
  private reportError(entry: LogEntry, isCritical = false) {
    // In production, integrate with error tracking service
    if (import.meta.env.PROD) {
      // Example: Send to error tracking service
      // fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // }).catch(() => {
      //   // Silently fail if reporting service is down
      // });
    }

    // Store critical errors in localStorage for debugging
    if (isCritical) {
      try {
        const criticalErrors = JSON.parse(
          localStorage.getItem('criticalErrors') || '[]'
        );
        criticalErrors.push(entry);
        // Keep only last 5 critical errors
        if (criticalErrors.length > 5) {
          criticalErrors.shift();
        }
        localStorage.setItem('criticalErrors', JSON.stringify(criticalErrors));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  /**
   * Get log history
   */
  getHistory(level?: LogLevel, limit = 50): LogEntry[] {
    let logs = [...this.logHistory];
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-limit);
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
  }

  /**
   * Add error listener
   */
  onError(listener: (entry: LogEntry) => void) {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  offError(listener: (entry: LogEntry) => void) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  /**
   * Log API error with full context
   */
  apiError(
    endpoint: string,
    method: string,
    status: number,
    error: Error,
    response?: any,
    context?: LogContext
  ) {
    const message = `API Error: ${method} ${endpoint} - ${status}`;
    const apiContext: LogContext = {
      ...context,
      endpoint,
      method,
      status,
      response: response ? JSON.stringify(response).substring(0, 500) : undefined,
    };

    if (status >= 500) {
      this.critical(message, error, apiContext);
    } else if (status >= 400) {
      this.error(message, error, apiContext);
    } else {
      this.warn(message, error, apiContext);
    }
  }

  /**
   * Log component error
   */
  componentError(
    componentName: string,
    error: Error,
    props?: any,
    context?: LogContext
  ) {
    const message = `Component Error: ${componentName}`;
    const componentContext: LogContext = {
      ...context,
      component: componentName,
      props: props ? JSON.stringify(props).substring(0, 500) : undefined,
    };

    this.error(message, error, componentContext);
  }

  /**
   * Log navigation error
   */
  navigationError(route: string, error: Error, context?: LogContext) {
    const message = `Navigation Error: Failed to navigate to ${route}`;
    const navContext: LogContext = {
      ...context,
      action: 'navigation',
      route,
    };

    this.error(message, error, navContext);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logWarn = (message: string, error?: Error, context?: LogContext) => logger.warn(message, error, context);
export const logError = (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context);
export const logCritical = (message: string, error?: Error, context?: LogContext) => logger.critical(message, error, context);

