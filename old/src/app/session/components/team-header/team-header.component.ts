import { Component } from '@angular/core';

import { TeamService } from '../../services/team.service';

@Component({
  selector: 'session-team-header',
  templateUrl: './team-header.component.html',
  styleUrls: ['./team-header.component.scss']
})
export class TeamHeaderComponent {

  //#region private properties ------------------------------------------------
  private readonly teamService: TeamService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get teamName(): string {
    return this.teamService.teamName;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamService: TeamService) {
    this.teamService = teamService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public shareTeamClick(): void {
    this.teamService.copyTeamLinkToClipBoard();
  }
  //#endregion

}
