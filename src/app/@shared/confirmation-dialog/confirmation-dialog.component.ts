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

  //#region  Constructor & C°
  constructor(
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public params: ConfirmationDialogParams) { }
  //#endregion

  //#region  Angular interface methods
  ngOnInit(): void {
    this.params.translateDefaults(this.translateService);
  }
  //#endregion

  //#region  UI triggered methods
  public cancel(): void {
    this.dialogRef.close();
  }
  //#endregion
}
