import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackbarComponent } from './snackbar.component';
import { SnackbarParams } from './snackbar.params';

import { SnackbarType } from './snackbar-type';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  //#region  Private properties
  private current?: MatSnackBarRef<any>;
  private queue: Array<SnackbarParams>;
  //#endregion

  //#region  Constructor & C°
  public constructor(private snackbar: MatSnackBar) {
    this.current = undefined;
    this.queue = new Array<SnackbarParams>();
  }
  //#endregion

  //#region  Public methods
  public showError(message: string): void {
    this.show(SnackbarType.Error, message);
  }

  public showInfo(message: string): void {
    this.show(SnackbarType.Info, message);
  }

  public showWarning(message: string): void {
    this.show(SnackbarType.Warning, message);
  }
  //#endregion

  //#region  Private methods
  private show(type: SnackbarType, message: string): void {
    if (this.current) {
      this.queue.push(new SnackbarParams(type, message));
    } else {
      this.open(new SnackbarParams(type, message));
    }
  }

  private open(params: SnackbarParams): void {
    this.current = this.snackbar.openFromComponent(
      SnackbarComponent,
      {
        data: params,
        duration: 5000
      });
    this.current.afterDismissed().subscribe( () => {
      this.current = undefined;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) {
          this.open(next);
        }
      }
    });
  }

  private onDismissed(): void {

  }
  //#endregion
}
