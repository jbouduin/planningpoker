import { ESnackbarType } from './snackbar-type.enum';

export class SnackbarParams {
  //#region public readonly properties ----------------------------------------
  public readonly type: ESnackbarType;
  public readonly message: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(type: ESnackbarType, message: string) {
    this.type = type;
    this.message = message;
  }
  //#endregion
}
