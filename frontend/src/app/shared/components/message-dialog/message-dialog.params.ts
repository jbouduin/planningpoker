import { AppTranslationKeys } from '../app-translation-keys';

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
    this.cancelButtonLabelKey = AppTranslationKeys.BUTTON_CANCEL_LABEL;
    this.cancelButtonParams = null;
    this.okButtonLabelKey = AppTranslationKeys.BUTTON_OK_LABEL;
    this.okButtonParams = null;
    this.textKey = AppTranslationKeys.CONFIRMATION_DIALOG_TEXT;
    this.textParams = null;
    this.titleKey = AppTranslationKeys.CONFIRMATION_DIALOG_TITLE;
    this.titleParams = null;
  }
  //#endregion
}
