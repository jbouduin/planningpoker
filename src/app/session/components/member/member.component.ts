import { Component, Input } from '@angular/core';
import { TeamService } from '@app/session/services/team.service';
import { TranslateService } from '@ngx-translate/core';
import { EParticipantStatus, ERole } from '@shared-lib';
import { Member } from '../../objects/member';


@Component({
  selector: 'session-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent {

  //#region @Input() ----------------------------------------------------------
  @Input() public member: Member | undefined;
  //#endregion

  //#region Private properties ------------------------------------------------
  private readonly teamService: TeamService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Public getter methods labels --------------------------------------
  public get connectionStatusIcon(): string {
    return this.member?.status === EParticipantStatus.Connected ? 'cloud' : 'cloud_off';
  }

  public get nick(): string {
    return this.member?.nick || '';
  }

  public get person(): string {
    return this.member?.observer ? "person_outline" : "person";
  }

  public get startEstimatingLabel(): string {
    return this.translateService.instant('Member.Menu.Label.Start_estimating');
  }

  public get stopEstimatingLabel(): string {
    return this.translateService.instant('Member.Menu.Label.Stop_estimating');
  }

  public get changeNickLabel(): string {
    return this.translateService.instant('Member.Menu.Label.Change_nick');
  }
  //#endregion

  //#region public getter methods authorization -------------------------------
  public get canChangeNick(): boolean {
    return this.member?.me || false;
  }
  public get canStartEstimating(): boolean {
    if (this.member) {
      return this.teamService.me.role === ERole.ScrumMaster ?
        this.member.observer :
        this.member.observer && this.member.me;
    }
    else {
      return false;
    }
  }

  public get canStopEstimating(): boolean {
    if (this.member) {
      return this.teamService.me.role === ERole.ScrumMaster ?
        !this.member.observer :
        !this.member.observer && this.member.me;
    }
    else {
      return false;
    }
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamService: TeamService, translateService: TranslateService) {
    this.teamService = teamService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public changeNickClick(): void {
    this.teamService.changeNick();
  }

  public startObserverClick(): void {
    this.teamService.switchObserving(true, this.member?.uuid || '');
  }

  public stopObserverClick(): void {
    this.teamService.switchObserving(false, this.member?.uuid || '');
  }
  //#endregion
}
