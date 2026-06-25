import { inject, Service } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ISimpleDialogParams } from '../../core';
import { MessageBoxComponent } from '../components';
import { MessageBoxParams } from '../components';

@Service()
export class DialogService {
  //#region private readonly properties ---------------------------------------
  private readonly dialog: MatDialog;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.dialog = inject(MatDialog);
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public showConfirmationDialog(params: MessageBoxParams): Observable<boolean> {
    const dialogRef = this.dialog.open(MessageBoxComponent, {
      width: '250px',
      data: params
    });

    return dialogRef.afterClosed().pipe(
      map((result) => {
        if (result) {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  public showSimpleDialog(params: ISimpleDialogParams): void {
    const messageBoxParams = new MessageBoxParams();
    messageBoxParams.showCancelButton = false;
    messageBoxParams.titleKey = params.dialogTitleKey;
    messageBoxParams.textKey = params.dialogMessageKey;
    this.dialog.open(MessageBoxComponent, {
      width: '250px',
      data: messageBoxParams
    });
  }
  //#endregion
}
