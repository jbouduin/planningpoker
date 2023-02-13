import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { ESnackbarType } from './snackbar-type.enum';
import { SnackbarParams } from './snackbar.params';

@Component({
  selector: 'common-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

  //#region Public getter methods ---------------------------------------------
  public get isInfo(): boolean {
    return this.params.type === ESnackbarType.Info;
  }

  public get isWarning(): boolean {
    return this.params.type === ESnackbarType.Warning;
  }

  public get isError(): boolean {
    return this.params.type === ESnackbarType.Error;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    private matSnackbarRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public params: SnackbarParams) { }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public close(): void {
    this.matSnackbarRef.dismiss();
  }
  //#endregion
}
