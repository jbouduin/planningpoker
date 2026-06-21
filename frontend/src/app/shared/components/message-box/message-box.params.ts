import { extract } from '../../../core';

export class MessageBoxParams {
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
    this.cancelButtonLabelKey = extract('Button.Generic.Label.Cancel');
    this.cancelButtonParams = null;
    this.okButtonLabelKey = extract('Button.Generic.Label.OK');
    this.okButtonParams = null;
    this.textKey = extract('MessageBox.Generic_confirmation.Text');
    this.textParams = null;
    this.titleKey = extract('MessageBox.Generic_confirmation.Title');
    this.titleParams = null;
  }
  //#endregion
}
