import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { UiEventsService } from './core';
import { ShellComponent } from './features/shell';
import { DialogService, SnackbarService } from './shared/services';

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, CommonModule, ShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    const snackbarSvc = inject(SnackbarService);
    const uiEventsSvc = inject(UiEventsService);
    const dialogSvc = inject(DialogService);

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
