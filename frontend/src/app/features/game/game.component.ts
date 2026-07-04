import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ERole } from 'shared-lib';
import { ESessionState, SessionService } from '../../core';
import {
  MembersPanelComponent,
  MyHandComponent,
  OverlayComponent,
  PlayfieldComponent,
  ScrumMasterButtonsComponent,
  TeamHeaderComponent
} from './components';
import { GameComponentState } from './game-component-state';

@Component({
  selector: 'app-game.component',
  imports: [
    OverlayComponent,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MembersPanelComponent,
    MyHandComponent,
    PlayfieldComponent,
    ScrumMasterButtonsComponent,
    TeamHeaderComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  //#region Signals -----------------------------------------------------------
  protected componentState: Signal<GameComponentState>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    const sessionSvc = inject(SessionService);
    this.componentState = computed(() => {
      const sessionState = sessionSvc.sessionState();
      const me = sessionSvc.me();
      let result: GameComponentState;
      if (me !== null) {
        result = {
          showMyHand: !me.observer,
          showOverlay: sessionState != ESessionState.Active && sessionState != ESessionState.Ended,
          showScrumMasterButtons: me.role == ERole.ScrumMaster
        };
        // return ;
      } else {
        result = {
          showMyHand: false,
          showOverlay: false,
          showScrumMasterButtons: false
        };
      }

      return result;
    });
  }
  //#endregion
}
