import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { ConfirmationDialogParams } from './confirmation-dialog.params';

@Component({
  selector: 'common-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private readonly translateService: TranslateService;
  private readonly dialogRef: MatDialogRef<ConfirmationDialogComponent>;
  private readonly params: ConfirmationDialogParams;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get cancelButtonLabel(): string {
    return this.params.cancelButtonLabel;
  }

  public get showCancelButton(): boolean {
    return this.params.showCancelButton;
  }

  public get okButtonLabel(): string {
    return this.params.okButtonLabel;
  }

  public get text(): string {
    return this.params.text;
  }

  public get title(): string {
    return this.params.title;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    translateService: TranslateService,
    dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) params: ConfirmationDialogParams) {
    this.translateService = translateService;
    this.dialogRef = dialogRef;
    this.params = params
    }
  //#endregion

  //#region Angular interface methods -----------------------------------------
  ngOnInit(): void {
    this.params.translateDefaults(this.translateService);
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }
  //#endregion
}
