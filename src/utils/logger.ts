export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  public static setLogLevel(level: LogLevel): void {
    Logger.level = level;
  }

  public static info(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.INFO) {
      console.log(`[AI Capabilities] ${message}`, ...args);
    }
  }

  public static warn(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.WARN) {
      console.warn(`[AI Capabilities WARN] ${message}`, ...args);
    }
  }

  public static error(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.ERROR) {
      console.error(`[AI Capabilities ERROR] ${message}`, ...args);
    }
  }

  public static debug(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.DEBUG) {
      console.debug(`[AI Capabilities DEBUG] ${message}`, ...args);
    }
  }
}
