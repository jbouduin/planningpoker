import { Component } from '@angular/core';
import { Member } from '@app/session/objects';
import { TeamService } from '@app/session/services/team.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'session-member-panel',
  templateUrl: './member-panel.component.html',
  styleUrls: ['./member-panel.component.scss']
})
export class MemberPanelComponent {

  //#region Private Properties ------------------------------------------------
  private teamService: TeamService;
  private translateService: TranslateService;
  //#endregion

  //#region Label Getters -----------------------------------------------------
  public get developersHeader(): string {
    return this.translateService.instant('Game.Component.Header.Developers');
  }

  public get observersHeader(): string {
    return this.translateService.instant('Game.Component.Header.Observers');
  }

  public get scrumMasterHeader(): string {
    return this.translateService.instant('Game.Component.Header.ScrumMaster');
  }
  //#endregion

  //#region Member getters ----------------------------------------------------
  public get observers(): Array<Member> {
    return this.teamService.observers;
  }

  public get developers(): Array<Member> {
    return this.teamService.developers;
  }

  public get scrumMaster(): Member | undefined {
    return this.teamService.scrumMaster;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamService: TeamService, translateService: TranslateService) {
    this.teamService = teamService;
    this.translateService = translateService;
  }
  //#endregion
}
