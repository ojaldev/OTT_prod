/**
 * Logger utility for consistent logging across the application
 * Supports different log levels and environments
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Configuration for the logger
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  appName: string;
}

// Default configuration based on environment variables
const getDefaultConfig = (): LoggerConfig => {
  // Parse log level from environment variable
  let logLevel = LogLevel.INFO;
  const envLogLevel = import.meta.env.VITE_LOG_LEVEL?.toLowerCase();
  if (envLogLevel === 'debug') logLevel = LogLevel.DEBUG;
  else if (envLogLevel === 'info') logLevel = LogLevel.INFO;
  else if (envLogLevel === 'warn') logLevel = LogLevel.WARN;
  else if (envLogLevel === 'error') logLevel = LogLevel.ERROR;
  
  // Parse other config options from environment variables
  const enableConsole = import.meta.env.VITE_LOG_TO_CONSOLE !== 'false';
  const enableRemote = import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true';
  
  return {
    minLevel: logLevel,
    enableConsole,
    enableRemote,
    appName: import.meta.env.VITE_APP_TITLE || 'OTT Dashboard'
  };
};

class Logger {
  private config: LoggerConfig;
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      ...getDefaultConfig(),
      ...config
    };
  }
  
  // Format log message with timestamp and metadata
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const appName = this.config.appName;
    let formattedMessage = `[${timestamp}] [${appName}] [${level}] ${message}`;
    
    if (data) {
      try {
        const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
        formattedMessage += ` - ${dataString}`;
      } catch (e) {
        formattedMessage += ' - [Unstringifiable data]';
      }
    }
    
    return formattedMessage;
  }
  
  // Send logs to remote service if enabled
  private async sendRemoteLog(level: LogLevel, message: string, data?: any): Promise<void> {
    if (!this.config.enableRemote || level < this.config.minLevel) return;
    
    // Implementation for remote logging service
    try {
      const logData = {
        level,
        message,
        timestamp: new Date().toISOString(),
        appName: this.config.appName,
        environment: import.meta.env.MODE,
        data
      };
      
      // Check if we have a remote logging endpoint configured
      const remoteLogEndpoint = import.meta.env.VITE_REMOTE_LOG_ENDPOINT;
      
      if (remoteLogEndpoint) {
        // Send to configured remote logging service
        await fetch(remoteLogEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify(logData)
        });
      } else if (import.meta.env.DEV) {
        // In development, just log to console if no endpoint is configured
        console.info('Remote logging would send:', logData);
      }
    } catch (e) {
      // Fallback to console if remote logging fails
      console.error('Failed to send log to remote service:', e);
    }
  }
  
  // Debug level logging
  debug(message: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.DEBUG) {
      if (this.config.enableConsole) {
        console.debug(this.formatMessage('DEBUG', message, data));
      }
      this.sendRemoteLog(LogLevel.DEBUG, message, data);
    }
  }
  
  // Info level logging
  info(message: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.INFO) {
      if (this.config.enableConsole) {
        console.info(this.formatMessage('INFO', message, data));
      }
      this.sendRemoteLog(LogLevel.INFO, message, data);
    }
  }
  
  // Warning level logging
  warn(message: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.WARN) {
      if (this.config.enableConsole) {
        console.warn(this.formatMessage('WARN', message, data));
      }
      this.sendRemoteLog(LogLevel.WARN, message, data);
    }
  }
  
  // Error level logging
  error(message: string, error?: any): void {
    if (this.config.minLevel <= LogLevel.ERROR) {
      if (this.config.enableConsole) {
        console.error(this.formatMessage('ERROR', message, error));
      }
      this.sendRemoteLog(LogLevel.ERROR, message, error);
    }
  }
  
  // Performance measurement
  time(label: string): void {
    if (this.config.minLevel <= LogLevel.DEBUG && this.config.enableConsole) {
      console.time(label);
    }
  }
  
  timeEnd(label: string): void {
    if (this.config.minLevel <= LogLevel.DEBUG && this.config.enableConsole) {
      console.timeEnd(label);
    }
  }
  
  // Group logs (useful for component lifecycle logging)
  group(label: string): void {
    if (this.config.minLevel <= LogLevel.DEBUG && this.config.enableConsole) {
      console.group(label);
    }
  }
  
  groupEnd(): void {
    if (this.config.minLevel <= LogLevel.DEBUG && this.config.enableConsole) {
      console.groupEnd();
    }
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export a function to create custom loggers with different configs
export const createLogger = (config: Partial<LoggerConfig>) => new Logger(config);

export default logger;
