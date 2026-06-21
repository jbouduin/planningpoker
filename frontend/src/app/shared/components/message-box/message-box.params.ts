export class MessageBoxParams {
  //#region Public properties -------------------------------------------------
  public showCancelButton: boolean;
  //#endregion

  //#region Private properties ------------------------------------------------
  private _cancelButtonLabelKey: string;
  private _okButtonLabelKey: string;
  private _textKey: string;
  private _titleKey: string;
  //#endregion

  //#region Public get/set properties -----------------------------------------
  public set cancelButtonLabelKey(value: string) {
    this._cancelButtonLabelKey = value;
  }

  public get cancelButtonLabelKey(): string {
    return this._cancelButtonLabelKey;
  }

  public set okButtonLabelKey(value: string) {
    this._okButtonLabelKey = value;
  }

  public get okButtonLabelKey(): string {
    return this._okButtonLabelKey;
  }

  public set textKey(value: string) {
    this._textKey = value;
  }

  public get textKey(): string {
    return this._textKey;
  }

  public set titleKey(value: string) {
    this._titleKey = value;
  }

  public get titleKey(): string {
    return this._titleKey;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.showCancelButton = true;
    this._cancelButtonLabelKey = 'Button.Generic.Label.Cancel';
    this._okButtonLabelKey = 'Button.Generic.Label.OK';
    this._textKey = 'MessageBox.Generic_confirmation.Text';
    this._titleKey = 'MessageBox.Generic_confirmation.Title';
  }
  //#endregion
}
