import { Service } from '@angular/core';
import { Logger } from './logger';

@Service()
export class LoggerService {
  // FEATURE: change loglevels at runtime

  //#region Private Fields ----------------------------------------------------
  private static readonly loggers: Map<string, Logger>;
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public static getLogger(source: string): Logger {
    let result = LoggerService.loggers.get(source);
    if (!result) {
      result = new Logger(source);
      LoggerService.loggers.set(source, result);
    }
    return result;
  }
  //#endregion
}
