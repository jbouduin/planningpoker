import { Service, signal, WritableSignal } from '@angular/core';
import { ISimpleDialogParams } from './simple-dialog.params';
import { SnackbarParams } from './snackbar.params';

@Service()
export class UiEventsService {
  //#region Signals -----------------------------------------------------------
  public snackbar: WritableSignal<SnackbarParams | null>;
  public simpleDialog: WritableSignal<ISimpleDialogParams | null>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.snackbar = signal<SnackbarParams | null>(null);
    this.simpleDialog = signal<ISimpleDialogParams | null>(null);
  }
  //#endregion

  //#region Public helper methods ---------------------------------------------
  public showError(messageKey: string): void {
    this.snackbar.set(SnackbarParams.Error(messageKey));
  }

  public showWarning(messageKey: string): void {
    this.snackbar.set(SnackbarParams.Warning(messageKey));
  }

  public showInfo(messageKey: string): void {
    this.snackbar.set(SnackbarParams.Info(messageKey));
  }

  public showSimpleDialog(params: ISimpleDialogParams): void {
    this.simpleDialog.set(params);
  }
  //#endregion
}
