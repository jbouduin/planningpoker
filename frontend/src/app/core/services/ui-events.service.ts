import { Service, signal, WritableSignal } from '@angular/core';
import { ISimpleDialogParams } from './simple-dialog.params';
import { SnackbarComponentParams } from './snackbar.component.params';

@Service()
export class UiEventsService {
  //#region Signals -----------------------------------------------------------
  public snackbar: WritableSignal<SnackbarComponentParams | null>;
  public simpleDialog: WritableSignal<ISimpleDialogParams | null>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.snackbar = signal<SnackbarComponentParams | null>(null);
    this.simpleDialog = signal<ISimpleDialogParams | null>(null);
  }
  //#endregion

  //#region Public helper methods ---------------------------------------------
  public showError(messageKey: string): void {
    this.snackbar.set(SnackbarComponentParams.error(messageKey));
  }

  public showWarning(messageKey: string): void {
    this.snackbar.set(SnackbarComponentParams.warning(messageKey));
  }

  public showInfo(messageKey: string): void {
    this.snackbar.set(SnackbarComponentParams.info(messageKey));
  }

  public showSimpleDialog(params: ISimpleDialogParams): void {
    this.simpleDialog.set(params);
  }
  //#endregion
}
