import { inject, injectable } from 'inversify';
import { Writable } from 'stream';
import * as winston from 'winston';
import { format, transports } from 'winston';

import { ILoggerService, LogType } from '../interfaces';
// TODO NOW import { INJECTABLETYPES } from '../../ioc/injectable-types';
// TODO NOW import { IEnvironmentService } from './environment.service';


@injectable()
export class LoggerService implements ILoggerService {

  //#region private properties ------------------------------------------------
  private readonly defaultLogger: winston.Logger;
  private readonly alwaysLogger: winston.Logger;
  private readonly unformattedLogger: winston.Logger;
  private readonly buffer: Array<string>;
  private readonly maxBufferSize = 250;
  private readonly consoleTransport: winston.transport;
  private readonly defaultStreamTransport: winston.transport;
  private readonly suppressAlwaysLog: boolean;
  //#endregion

  //#region public properties -------------------------------------------------
  public get transports(): Array<winston.transport> {
    return new Array<winston.transport>(this.consoleTransport, this.defaultStreamTransport);
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  // TODO NOW public constructor(@inject(INJECTABLETYPES.EnvironmentService) environmentService: IEnvironmentService) {
  public constructor() {
    this.suppressAlwaysLog = false;  //environmentService.isCi;
    this.buffer = new Array<string>();
    this.consoleTransport = new transports.Console({ level: 'debug' /* environmentService.logLevel.toLowerCase()*/ });
    this.defaultStreamTransport = this.initializeStreamTransport('debug' /* environmentService.logLevel.toLowerCase() */);

    this.defaultLogger = this.initializeDefaultLogger();

    this.alwaysLogger = this.initializeAlwaysLogger();

    this.unformattedLogger = winston.createLogger({
      transports: [
        new transports.Console({ level: 'info' })
      ],
      format: format.combine(format.printf((info: winston.Logform.TransformableInfo) => {
        //eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `${info.message}`;
      }))
    })
  }
  //#endregion

  //#region ILoggerService members --------------------------------------------
  public debug(message: string): void {
    this.defaultLogger.debug(message);
  }

  public error(message: string): void {
    this.defaultLogger.error(message);
  }

  public info(message: string): void {
    this.defaultLogger.info(message);
  }

  public warning(message: string): void {
    this.defaultLogger.warn(message);
  }

  public alwaysLog(message: string, level = 'info'): void {
    if (!this.suppressAlwaysLog) {
      this.alwaysLogger.log(level, message);
    }
  }

  public unformatted(message: string): void {
    this.unformattedLogger.info(message);
  }

  public getDefaultLogFormat(label: string): winston.Logform.Format {
    return format.combine(
      format.label({ label: label }),
      format.timestamp(),
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      format.printf((info: winston.Logform.TransformableInfo) => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
    )
  }

  public getLog(logType?: LogType, size?: number): Array<string> {
    let result: Array<string>;
    switch (logType) {
      case 'API':
      case 'Express': {
        const filter = `[${logType}]`;
        result = this.buffer.slice().filter((entry: string) => entry.indexOf(filter) > 0);
        break;
      }
      default:
        result = this.buffer.slice();
    }
    return size ?
      result.slice(-size) :
      result;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private initializeDefaultLogger(): winston.Logger {
    return winston.createLogger({
      transports: this.transports,
      format: this.getDefaultLogFormat('API')
    });
  }

  private initializeAlwaysLogger(): winston.Logger {
    return winston.createLogger({
      transports: [
        new transports.Console({ level: 'silly' }),
        this.initializeStreamTransport('silly')
      ],
      format: this.getDefaultLogFormat('API')
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
    }
    return new transports.Stream({ stream: stream, level: level });
  }
  //#endregion
}