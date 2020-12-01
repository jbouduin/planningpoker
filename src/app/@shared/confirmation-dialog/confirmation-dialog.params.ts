import { TranslateService } from '@ngx-translate/core';

export class ConfirmationDialogParams {

  //#region  Public properties
  public showCancelButton: boolean;
  //#endregion

  //#region  Private properties
  private _translateService!: TranslateService;
  private _translatedCancelButtonLabel!: string;
  private _translatedOkButtonLabel!: string;
  private _translatedText!: string;
  private _translatedTitle!: string;
  //#endregion

  //#region  Public get/set properties
  public set cancelButtonLabel(value: string) {
    this._translatedCancelButtonLabel = value;
  }

  public get cancelButtonLabel(): string {
    return this._translatedCancelButtonLabel;
  }

  public set okButtonLabel(value: string) {
    this._translatedOkButtonLabel = value;
  }

  public get okButtonLabel(): string {
    return this._translatedOkButtonLabel;
  }

  public set text(value: string) {
    this._translatedText = value;
  }

  public get text(): string {
    return this._translatedText;
  }

  public set title(value: string) {
    this._translatedTitle = value;
  }

  public get title(): string {
    return this._translatedTitle;
  }
  //#endregion

  //#region  Constructor & C°
  public constructor() {
    this.showCancelButton = true;
  }
  //#endregion

  //#region  Public methods
  public translateDefaults(translateService: TranslateService) {
    // we have to use a class property, otherwise nxg-translate-extract doesn't extract the keys
    this._translateService = translateService;
    if (!this._translatedCancelButtonLabel) {
      this.cancelButtonLabel = this._translateService.instant('Dialog.ButtonLabel.Cancel');
    }

    if (!this._translatedOkButtonLabel) {
      this.okButtonLabel = this._translateService.instant('Dialog.ButtonLabel.OK');
    }

    if (!this._translatedText) {
      this.text = this._translateService.instant('Dialog.Text.Confirm.Are_you_sure');
    }

    if (!this._translatedText) {
      this.text = this._translateService.instant('Dialog.Text.Title.Confirm.Confirm');
    }
  }
  //#endregion
}
