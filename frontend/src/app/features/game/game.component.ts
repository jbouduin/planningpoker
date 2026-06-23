import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from '../../core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { TeamHeaderComponent } from './components/team-header.component';
import { MyHandComponent } from './components/my-hand.component';
import { PlayfieldComponent } from './components/playfield.component';
import { MembersPanelComponent } from './components/members-panel.component';
import { ScrumMasterButtonsComponent } from './components/scrum-master-buttons.component';

@Component({
  selector: 'app-game.component',
  imports: [
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
  private readonly sessionSvc: SessionService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionSvc: SessionService) {
    this.sessionSvc = sessionSvc;
  }
  //#endregion
}
