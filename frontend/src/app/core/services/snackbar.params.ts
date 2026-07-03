import { ESnackbarType } from './snackbar-type.enum';

export class SnackbarParams {
  //#region public readonly properties ----------------------------------------
  public readonly type: ESnackbarType;
  public readonly messageKey: string;
  public readonly messageParams: Record<string, unknown> | null;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  private constructor(type: ESnackbarType, messageKey: string, messageParams: Record<string, unknown> | null) {
    this.type = type;
    this.messageKey = messageKey;
    this.messageParams = messageParams;
  }

  public static warning(messageKey: string, messageParams?: Record<string, unknown>): SnackbarParams {
    return new SnackbarParams(ESnackbarType.Warning, messageKey, messageParams ?? null);
  }

  public static error(messageKey: string, messageParams?: Record<string, unknown>): SnackbarParams {
    return new SnackbarParams(ESnackbarType.Error, messageKey, messageParams ?? null);
  }

  public static info(messageKey: string, messageParams?: Record<string, unknown>): SnackbarParams {
    return new SnackbarParams(ESnackbarType.Info, messageKey, messageParams ?? null);
  }
  //#endregion
}
