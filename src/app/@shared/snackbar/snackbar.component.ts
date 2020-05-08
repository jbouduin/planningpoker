import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { SnackbarType } from './snackbar-type';
import { SnackbarParams } from './snackbar.params';

@Component({
  selector: 'app-snackba',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit {

  // <editor-fold desc='Public getter methods'>
  public get isInfo(): boolean {
    return this.params.type === SnackbarType.Info;
  }

  public get isWarning(): boolean {
    return this.params.type === SnackbarType.Warning;
  }

  public get isError(): boolean {
    return this.params.type === SnackbarType.Error;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private matSnackbarRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public params: SnackbarParams) { }
  // </editor-fold>

  // <editor-fold desc='Angular Interface methods'>
  // </editor-fold>
  public ngOnInit(): void {
  }

  // <editor-fold desc='UI triggered methods'>
  public close(): void {
    this.matSnackbarRef.dismiss();
  }
  // </editor-fold>
}
