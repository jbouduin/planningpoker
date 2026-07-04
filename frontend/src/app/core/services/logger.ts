enum LogLevel {
  Off = 0,
  Error,
  Warning,
  Info,
  Debug
}

// TODO make a logger service who creates the logs
/* eslint-disable @typescript-eslint/no-explicit-any */
export class Logger {
  //#region static ------------------------------------------------------------
  /**
   * Current logging level.
   * Set it to LogLevel.Off to disable logs completely.
   */
  private level: LogLevel;

  /**
   * Additional log outputs.
   */

  /**
   * Enables production mode.
   * Sets logging level to LogLevel.Warning.
   */
  public enableProductionMode(): void {
    this.level = LogLevel.Warning;
  }
  //#endregion

  //#region private properties ------------------------------------------------
  private readonly source: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(source: string) {
    this.level = LogLevel.Debug;
    this.source = source;
  }
  //#endregion

  //#region Logging methods ----------------------------------------------------
  /* eslint-disable no-console */
  public debug(message: string, ...objects: Array<any>): void {
    this.log(console.log, LogLevel.Debug, message, objects);
  }

  public info(message: string, ...objects: Array<any>): void {
    this.log(console.info, LogLevel.Info, message, objects);
  }

  public warn(message: string, ...objects: Array<any>): void {
    this.log(console.warn, LogLevel.Warning, message, objects);
  }

  public error(message: string, ...objects: Array<any>): void {
    this.log(console.error, LogLevel.Error, message, objects);
  }
  /* eslint-enable no-console */
  //#endregion

  //#region Private methods ---------------------------------------------------
  private log(
    func: (message: any, ...args: Array<any>) => void,
    level: LogLevel,
    msg: string,
    objects: Array<any>
  ): void {
    if (level <= this.level) {
      // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
      func.apply(console, [`[${this.source}] ${msg}`, ...objects]);
    }
  }
  //#endregion
}
