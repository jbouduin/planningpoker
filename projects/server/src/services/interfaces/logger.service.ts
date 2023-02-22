import winston = require("winston");

export type LogType = 'Express' | 'API';

export interface ILoggerService {
  readonly transports: Array<winston.transport>;

  alwaysLog(message: string, level?: string): void;
  debug(message: string): void;
  error(message: string): void;
  info(message: string): void;
  unformatted(message: string): void;
  warning(message: string): void;

  getDefaultLogFormat(label: string): winston.Logform.Format;
  getLog(logType?: LogType, size?: number): Array<string>;
}