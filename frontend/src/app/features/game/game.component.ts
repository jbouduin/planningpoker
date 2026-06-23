import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SessionService } from '../../core';
import {
  MembersPanelComponent,
  MyHandComponent,
  PlayfieldComponent,
  ScrumMasterButtonsComponent,
  TeamHeaderComponent
} from './components';
import { CommonModule } from '@angular/common';
import { ERole } from 'shared-lib';

@Component({
  selector: 'app-game.component',
  imports: [
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
  //#region Protected fields --------------------------------------------------
  protected readonly ROLE = ERole;
  protected readonly sessionSvc: SessionService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionSvc: SessionService) {
    this.sessionSvc = sessionSvc;
  }
  //#endregion
}
