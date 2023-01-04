import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacySnackBarRef as MatSnackBarRef, MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar';

import { SnackbarType } from './snackbar-type';
import { SnackbarParams } from './snackbar.params';

@Component({
  selector: 'app-snackba',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit {

  //#region  Public getter methods
  public get isInfo(): boolean {
    return this.params.type === SnackbarType.Info;
  }

  public get isWarning(): boolean {
    return this.params.type === SnackbarType.Warning;
  }

  public get isError(): boolean {
    return this.params.type === SnackbarType.Error;
  }
  //#endregion

  //#region  Constructor & C°
  public constructor(
    private matSnackbarRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public params: SnackbarParams) { }
  //#endregion

  //#region  Angular Interface methods
  //#endregion
  public ngOnInit(): void {
  }

  //#region  UI triggered methods
  public close(): void {
    this.matSnackbarRef.dismiss();
  }
  //#endregion
}
