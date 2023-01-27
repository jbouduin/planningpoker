import { Component } from '@angular/core';
import { TeamService } from '@app/session/services/team.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'session-member-buttons',
  templateUrl: './member-buttons.component.html',
  styleUrls: ['./member-buttons.component.sass']
})
export class MemberButtonsComponent {
  //#region Private Properties ------------------------------------------------
  private readonly teamService: TeamService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get leaveLabel(): string {
    return this.teamService.scrumMaster?.me ?
      this.translateService.instant('Game.Component.ButtonLabel.End_session') :
      this.translateService.instant('Game.Component.ButtonLabel.Leave_game');
  }

  public get pauseButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Pause');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamService: TeamService,    translateService: TranslateService) {
    this.teamService = teamService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public disconnect(): void{
    // TODO this.teamService.disconnect();
  }

  public leave(): void {
    this.teamService.leave();
  }
  //#endregion
}
