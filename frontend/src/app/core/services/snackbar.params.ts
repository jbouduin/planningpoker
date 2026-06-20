import { ESnackbarType } from './snackbar-type.enum';

export class SnackbarParams {
  //#region public readonly properties ----------------------------------------
  public readonly type: ESnackbarType;
  public readonly message: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  private constructor(type: ESnackbarType, message: string) {
    this.type = type;
    this.message = message;
  }

  public static Warning(messageKey: string): SnackbarParams {
    return new SnackbarParams(ESnackbarType.Warning, messageKey);
  }

  public static Error(messageKey: string): SnackbarParams {
    return new SnackbarParams(ESnackbarType.Error, messageKey);
  }

  public static Info(messageKey: string): SnackbarParams {
    return new SnackbarParams(ESnackbarType.Info, messageKey);
  }
  //#endregion
}
