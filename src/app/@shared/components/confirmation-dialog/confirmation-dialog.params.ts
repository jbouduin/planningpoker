import { TranslateService } from '@ngx-translate/core';

export class ConfirmationDialogParams {

  //#region Public properties -------------------------------------------------
  public showCancelButton: boolean;
  //#endregion

  //#region Private properties ------------------------------------------------
  private translateService!: TranslateService;
  private translatedCancelButtonLabel!: string;
  private translatedOkButtonLabel!: string;
  private translatedText!: string;
  private translatedTitle!: string;
  //#endregion

  //#region Public get/set properties -----------------------------------------
  public set cancelButtonLabel(value: string) {
    this.translatedCancelButtonLabel = value;
  }

  public get cancelButtonLabel(): string {
    return this.translatedCancelButtonLabel;
  }

  public set okButtonLabel(value: string) {
    this.translatedOkButtonLabel = value;
  }

  public get okButtonLabel(): string {
    return this.translatedOkButtonLabel;
  }

  public set text(value: string) {
    this.translatedText = value;
  }

  public get text(): string {
    return this.translatedText;
  }

  public set title(value: string) {
    this.translatedTitle = value;
  }

  public get title(): string {
    return this.translatedTitle;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.showCancelButton = true;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public translateDefaults(translateService: TranslateService) {
    // we have to use a class property, otherwise nxg-translate-extract doesn't extract the keys
    this.translateService = translateService;
    if (!this.translatedCancelButtonLabel) {
      this.cancelButtonLabel = this.translateService.instant('Dialog.ButtonLabel.Cancel');
    }

    if (!this.translatedOkButtonLabel) {
      this.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.OK');
    }

    if (!this.translatedText) {
      this.text = this.translateService.instant('Dialog.Text.Confirm.Are_you_sure');
    }

    if (!this.translatedText) {
      this.text = this.translateService.instant('Dialog.Text.Title.Confirm.Confirm');
    }
  }
  //#endregion
}
