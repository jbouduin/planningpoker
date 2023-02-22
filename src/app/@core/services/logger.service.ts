enum LogLevel {
  Off = 0,
  Error,
  Warning,
  Info,
  Debug
}

export class Logger {
  //#region static ------------------------------------------------------------
  /**
   * Current logging level.
   * Set it to LogLevel.Off to disable logs completely.
   */
  private static level = LogLevel.Debug;

  /**
   * Additional log outputs.
   */

  /**
   * Enables production mode.
   * Sets logging level to LogLevel.Warning.
   */
  public static enableProductionMode() {
    Logger.level = LogLevel.Warning;
  }
  //#endregion

  //#region private properties ------------------------------------------------
  private readonly source: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(source: string) {
    this.source = source;
  }
  //#endregion

  //#region Logging methods ----------------------------------------------------
  /* eslint-disable @typescript-eslint/no-explicit-any,  no-console */
  public debug(...objects: Array<any>) {
    this.log(console.log, LogLevel.Debug, objects);
  }

  public info(...objects: Array<any>) {
    this.log(console.info, LogLevel.Info, objects);
  }

  public warn(...objects: Array<any>) {
    this.log(console.warn, LogLevel.Warning, objects);
  }

  public error(...objects: Array<any>) {
    this.log(console.error, LogLevel.Error, objects);
  }

  //#endregion

  //#region Private methods ---------------------------------------------------
  private log(func: (...args: Array<any>) => void, level: LogLevel, objects: Array<any>) {
    if (level <= Logger.level) {
      const log = ['[' + this.source + ']'].concat(objects.map(x => JSON.stringify(x)));
      func.apply(console, log);
    }
  }
  //#endregion

  /* eslint-enable @typescript-eslint/no-explicit-any,  no-console */
}
