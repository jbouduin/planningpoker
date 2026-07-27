import { Service } from '@angular/core';
import { Logger } from './logger';

@Service()
export class LoggerService {
  // FEATURE: change loglevels at runtime

  //#region Private Fields ----------------------------------------------------
  private readonly loggers: Map<string, Logger>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.loggers = new Map<string, Logger>();
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public getLogger(source: string): Logger {
    let result = this.loggers.get(source);
    if (!result) {
      result = new Logger(source);
      this.loggers.set(source, result);
    }
    return result;
  }
  //#endregion
}
