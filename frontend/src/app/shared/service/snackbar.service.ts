import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackbarParams } from '../components/snackbar/snackbar.params';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { ESnackbarType } from '../components/snackbar/snackbar-type.enum';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  //#region Private properties ------------------------------------------------
  private readonly snackbar: MatSnackBar;
  private readonly queue: Array<SnackbarParams>;
  private current?: MatSnackBarRef<SnackbarComponent>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(snackbar: MatSnackBar) {
    this.snackbar = snackbar;
    this.current = undefined;
    this.queue = new Array<SnackbarParams>();
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public showError(message: string): void {
    this.show(ESnackbarType.Error, message);
  }

  public showInfo(message: string): void {
    this.show(ESnackbarType.Info, message);
  }

  public showWarning(message: string): void {
    this.show(ESnackbarType.Warning, message);
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private show(type: ESnackbarType, message: string): void {
    if (this.current) {
      this.queue.push(new SnackbarParams(type, message));
    } else {
      this.open(new SnackbarParams(type, message));
    }
  }

  private open(params: SnackbarParams): void {
    this.current = this.snackbar.openFromComponent(SnackbarComponent, {
      data: params,
      duration: 5000
    });
    this.current.afterDismissed().subscribe(() => {
      this.current = undefined;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) {
          this.open(next);
        }
      }
    });
  }
  //#endregion
}
