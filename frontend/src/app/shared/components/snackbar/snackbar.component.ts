import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ESnackbarType } from '../../../core/services/snackbar-type.enum';
import { SnackbarParams } from '../../../core/services/snackbar.params';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-snackbar',
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
  //#region Public properties ------------------------------------------------.
  public params: SnackbarParams = inject<SnackbarParams>(MAT_SNACK_BAR_DATA);
  //#endregion

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
  public constructor(private matSnackbarRef: MatSnackBarRef<SnackbarComponent>) {}
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public close(): void {
    this.matSnackbarRef.dismiss();
  }
  //#endregion
}
