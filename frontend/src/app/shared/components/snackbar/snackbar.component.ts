import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { ESnackbarType, SnackbarParams } from '../../../core';

@Component({
  selector: 'app-snackbar',
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
  //#region Private Fields ----------------------------------------------------
  private matSnackbarRef: MatSnackBarRef<SnackbarComponent>;
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected readonly params: SnackbarParams;
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  public get isInfo(): boolean {
    return this.params.type == ESnackbarType.Info;
  }

  public get isWarning(): boolean {
    return this.params.type == ESnackbarType.Warning;
  }

  public get isError(): boolean {
    return this.params.type == ESnackbarType.Error;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(matSnackbarRef: MatSnackBarRef<SnackbarComponent>) {
    this.matSnackbarRef = matSnackbarRef;
    this.params = inject<SnackbarParams>(MAT_SNACK_BAR_DATA);
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public close(): void {
    this.matSnackbarRef.dismiss();
  }
  //#endregion
}
