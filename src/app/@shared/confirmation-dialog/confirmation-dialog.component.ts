import { Component, Inject, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { ConfirmationDialogParams } from './confirmation-dialog.params';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  // <editor-fold desc='Constructor & C°'>
  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public params: ConfirmationDialogParams) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit(): void {
  }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public cancel(): void {
    this.dialogRef.close();
  }
  // </editor-fold>
}
