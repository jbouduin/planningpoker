import { extract } from '../../../core';

export class MessageDialogParams {
  //#region Public properties -------------------------------------------------
  public showCancelButton: boolean;
  public cancelButtonLabelKey: string;
  public cancelButtonParams: Record<string, unknown> | null;
  public okButtonLabelKey: string;
  public okButtonParams: Record<string, unknown> | null;
  public textKey: string;
  public textParams: Record<string, unknown> | null;
  public titleKey: string;
  public titleParams: Record<string, unknown> | null;
  //#endregion

  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.showCancelButton = true;
    this.cancelButtonLabelKey = extract('App.Button.Cancel');
    this.cancelButtonParams = null;
    this.okButtonLabelKey = extract('App.Button.OK');
    this.okButtonParams = null;
    this.textKey = extract('App.Confirmation.Text');
    this.textParams = null;
    this.titleKey = extract('App.Confirmation.Title');
    this.titleParams = null;
  }
  //#endregion
}
