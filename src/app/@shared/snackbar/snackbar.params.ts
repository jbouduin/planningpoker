import { SnackbarType } from './snackbar-type';

export class SnackbarParams {

  //#region  Constructor & C°
  public constructor(public type: SnackbarType, public message: string) { }
  //#endregion

}
