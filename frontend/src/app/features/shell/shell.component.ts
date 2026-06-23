import { Component, effect } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SessionService } from '../../core';
import { ESessionState } from '../../core/services/session-state.enum';

@Component({
  selector: 'app-shell',
  imports: [HeaderComponent, RouterModule, MatToolbarModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  //#region Constructor & C° --------------------------------------------------
  public constructor(router: Router, sessionSvc: SessionService) {
    effect(() => {
      const sessionState = sessionSvc.sessionState();
      if (sessionState == ESessionState.Active) {
        void router.navigate(['game']);
      } else if (sessionState == ESessionState.Inactive) {
        void router.navigate(['']);
      }
    });
  }
  //#endregion
}
