import { Component } from '@angular/core';
import { SessionService } from '@app/session/services/session.service';
import { TeamService } from '@app/session/services/team.service';
import { TranslateService } from '@ngx-translate/core';
import { EParticipantStatus, ERole } from '@shared-lib';

@Component({
  selector: 'session-member-buttons',
  templateUrl: './member-buttons.component.html',
  styleUrls: ['./member-buttons.component.scss']
})
export class MemberButtonsComponent {

  //#region Private Properties ------------------------------------------------
  private readonly sessionService: SessionService;
  private readonly teamService: TeamService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get canPause(): boolean {
    return this.teamService.me.status === EParticipantStatus.Connected;
  }

  public get canRejoin(): boolean {
    return this.teamService.me.status === EParticipantStatus.Paused;
  }

  public get leaveLabel(): string {
    return this.teamService.me.role === ERole.ScrumMaster ?
      this.translateService.instant('ScrumMasterButtons.Component.Button.EndSession.Label') :
      this.translateService.instant('MemberButtons.Component.Button.Leave.Label');
  }

  public get pauseButtonLabel(): string {
    return this.translateService.instant('MemberButtons.Component.Button.Pause.Label');
  }

  public get rejoinButtonLabel(): string {
    return this.translateService.instant('MemberButtons.Component.Button.Rejoin.Label');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionService: SessionService, teamService: TeamService, translateService: TranslateService) {
    this.sessionService = sessionService
    this.teamService = teamService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public pause(): void{
    this.teamService.pause();
  }

  public leave(): void {
    this.teamService.leave();
  }

  public rejoin(): void {
    this.sessionService.rejoin(this.teamService.teamName, this.teamService.me.uuid);
  }
  //#endregion
}
