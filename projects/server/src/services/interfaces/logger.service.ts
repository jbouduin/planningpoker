import winston = require("winston");

export type LogType = 'Express' | 'Server' | 'Socket';

export interface ILoggerService {
  readonly transports: Array<winston.transport>;

  debug(logType: LogType, message: string): void;
  error(logType: LogType, message: string): void;
  info(logType: LogType, message: string): void;
  warning(logType: LogType, message: string): void;
  logError(logType: LogType, error: Error): void;

  getDefaultLogFormat(label: string): winston.Logform.Format;
  getLog(logType?: LogType, size?: number): Array<string>;
}