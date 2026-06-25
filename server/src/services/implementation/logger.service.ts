import { inject, injectable } from 'inversify';
import { Writable } from 'stream';
import * as winston from 'winston';
import { format, transports } from 'winston';
import { IEnvironmentService, ILoggerService, LogType } from '../interfaces';
import SERVICETYPES from '../service.types';

@injectable()
export class LoggerService implements ILoggerService {
  //#region private properties ------------------------------------------------
  private readonly serverLogger: winston.Logger;
  private readonly socketLogger: winston.Logger;
  private readonly buffer: Array<string>;
  private readonly maxBufferSize = 250;
  private readonly consoleTransport: winston.transport;
  private readonly defaultStreamTransport: winston.transport;
  //#endregion

  //#region public properties -------------------------------------------------
  public get transports(): Array<winston.transport> {
    return new Array<winston.transport>(this.consoleTransport, this.defaultStreamTransport);
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.EnvironmentService) environmentService: IEnvironmentService) {
    this.buffer = new Array<string>();
    this.consoleTransport = new transports.Console({ level: environmentService.logLevel.toLowerCase() });
    this.defaultStreamTransport = this.initializeStreamTransport(environmentService.logLevel.toLowerCase());
    this.serverLogger = this.initializeDefaultLogger('Server');
    this.socketLogger = this.initializeDefaultLogger('Socket');
  }
  //#endregion

  //#region ILoggerService members --------------------------------------------
  public debug(logType: LogType, message: string): void {
    switch (logType) {
      case 'Server':
        this.serverLogger.debug(message);
        break;
      case 'Socket':
        this.socketLogger.debug(message);
        break;
    }
  }

  public error(logType: LogType, message: string): void {
    switch (logType) {
      case 'Server':
        this.serverLogger.error(message);
        break;
      case 'Socket':
        this.socketLogger.error(message);
        break;
    }
  }

  public info(logType: LogType, message: string): void {
    switch (logType) {
      case 'Server':
        this.serverLogger.info(message);
        break;
      case 'Socket':
        this.socketLogger.info(message);
        break;
    }
  }

  public warning(logType: LogType, message: string): void {
    switch (logType) {
      case 'Server':
        this.serverLogger.warn(message);
        break;
      case 'Socket':
        this.socketLogger.warn(message);
        break;
    }
  }

  public logError(logType: LogType, error: Error): void {
    switch (logType) {
      case 'Server':
        this.serverLogger.error(error.stack);
        break;
      case 'Socket':
        this.socketLogger.warn(error.stack);
        break;
    }
  }

  public getDefaultLogFormat(label: string): winston.Logform.Format {
    return format.combine(
      format.label({ label: label }),
      format.timestamp(),
      format.printf(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        (info: winston.Logform.TransformableInfo) => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
      )
    );
  }

  public getLog(logType?: LogType, size?: number): Array<string> {
    let result: Array<string>;
    switch (logType) {
      case 'Server':
      case 'Express': {
        const filter = `[${logType}]`;
        result = this.buffer.slice().filter((entry: string) => entry.indexOf(filter) > 0);
        break;
      }
      default:
        result = this.buffer.slice();
    }
    return size ? result.slice(-size) : result;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private initializeDefaultLogger(logType: LogType): winston.Logger {
    return winston.createLogger({
      transports: this.transports,
      format: this.getDefaultLogFormat(logType)
    });
  }

  private initializeStreamTransport(level: string): winston.transport {
    const stream = new Writable();
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream._write = (chunk: any, _encoding: BufferEncoding, next: (error: Error | null | undefined) => void) => {
      //eslint-disable-next-line
      this.buffer.push(chunk.toString().replace('\r\n', ''));
      const lengthOfBuffer = this.buffer.length;
      if (lengthOfBuffer > this.maxBufferSize) {
        this.buffer.splice(0, lengthOfBuffer - this.maxBufferSize);
      }
      next(null);
    };
    return new transports.Stream({ stream: stream, level: level });
  }
  //#endregion
}
