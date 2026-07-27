import { inject, Service } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarComponentParams } from '../../core';
import { SnackbarComponent } from '../components';

@Service()
export class SnackbarService {
  //#region Private properties ------------------------------------------------
  private readonly snackbar: MatSnackBar;
  private readonly queue: Array<SnackbarComponentParams>;
  private current?: MatSnackBarRef<SnackbarComponent>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.snackbar = inject(MatSnackBar);
    this.current = undefined;
    this.queue = new Array<SnackbarComponentParams>();
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public show(params: SnackbarComponentParams): void {
    if (this.current) {
      this.queue.push(params);
    } else {
      this.open(params);
    }
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private open(params: SnackbarComponentParams): void {
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
