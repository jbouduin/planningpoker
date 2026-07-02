import { Clipboard } from '@angular/cdk/clipboard';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { extract, SessionService, UiEventsService } from '../../../../core';
import { ENVIRONMENT } from '../../../../../environments/environment';

@Component({
  selector: 'app-team-header',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './team-header.component.html',
  styleUrl: './team-header.component.scss'
})
export class TeamHeaderComponent {
  // FEATURE current backlog item name
  //#region Private fields ----------------------------------------------------
  private readonly uiEventsSvc: UiEventsService;
  private readonly clipboard: Clipboard;
  //#endregion

  //#region Protected fields --------------------------------------------------
  protected readonly sessionSvc: SessionService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(clipboard: Clipboard, sessionSvc: SessionService, uiEventsSvc: UiEventsService) {
    this.clipboard = clipboard;
    this.sessionSvc = sessionSvc;
    this.uiEventsSvc = uiEventsSvc;
  }
  //#endregion

  //#region UI-triggers -------------------------------------------------------
  protected shareTeamClick(): void {
    if (this.clipboard.copy(`${ENVIRONMENT.webHost}/home?team=${this.sessionSvc.teamName()}`)) {
      this.uiEventsSvc.showInfo(extract('MessageBox.Link_to_team_is_copied_to_clipboard.Text'));
    } else {
      this.uiEventsSvc.showInfo(extract('MessageBox.Error_copying_Link_to_team_to_clipboard.Text'));
    }
  }
  //#endregion
}
