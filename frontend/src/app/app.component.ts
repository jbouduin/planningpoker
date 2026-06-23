import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { UiEventsService } from './core';
import { ShellComponent } from './features/shell/shell.component';
import { DialogService } from './shared/service/dialog.service';
import { SnackbarService } from './shared/service/snackbar.service';

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, CommonModule, ShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  //#region Constructor & C° --------------------------------------------------
  public constructor(snackbarSvc: SnackbarService, uiEventsSvc: UiEventsService, dialogSvc: DialogService) {
    effect(() => {
      const snackBarSignal = uiEventsSvc.snackbar();
      if (snackBarSignal !== null) {
        snackbarSvc.show(snackBarSignal);
        uiEventsSvc.snackbar.set(null);
      }
    });

    effect(() => {
      const simpleDialogSignal = uiEventsSvc.simpleDialog();
      if (simpleDialogSignal !== null) {
        dialogSvc.showSimpleDialog(simpleDialogSignal);
        uiEventsSvc.simpleDialog.set(null);
      }
    });
  }
  //#endregion
}
