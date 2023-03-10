import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { EParticipantStatus, ERole } from '@shared-lib';

import { Member, SessionService } from '@shared/services';
import { TeamService } from '../../services';

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
  private readonly sessionService: SessionService;
  private readonly teamService: TeamService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Public getter methods labels --------------------------------------
  public get connectionStatusIcon(): string {
    switch (this.member?.status) {
      case EParticipantStatus.Connected:
        return 'cloud';
      case EParticipantStatus.Paused:
        return 'notifications_paused';
      case EParticipantStatus.Disconnected:
      default:
        return 'cloud_off';
    }
  }

  public get nick(): string {
    return this.member?.nick || '';
  }

  public get person(): string {
    return this.member?.observer ? "person_outline" : "person";
  }

  public get startEstimatingLabel(): string {
    return this.translateService.instant('Member.Component.MenuItem.Start_estimating');
  }

  public get stopEstimatingLabel(): string {
    return this.translateService.instant('Member.Component.MenuItem.Stop_estimating');
  }

  public get changeNickLabel(): string {
    return this.translateService.instant('Member.Component.MenuItem.Change_nick');
  }

  public get changeScrumMasterLabel(): string {
    return this.translateService.instant('Member.Component.MenuItem.Change_scrummaster');
  }

  public get removeParticipantLabel(): string {
    return this.translateService.instant('Member.Component.MenuItem.Remove_participant');
  }
  //#endregion

  //#region public getter methods authorization -------------------------------
  public get canChangeNick(): boolean {
    return this.member?.me || false;
  }

  public get canChangeScrumMaster(): boolean {
    return this.member?.role === ERole.ScrumMaster;
  }

  public get canStartEstimating(): boolean {
    if (this.member) {
      return this.sessionService.scrumMaster ?
        this.member.observer :
        this.member.observer && this.member.me;
    }
    else {
      return false;
    }
  }

  public get canStopEstimating(): boolean {
    if (this.member) {
      return this.sessionService.scrumMaster ?
        !this.member.observer :
        !this.member.observer && this.member.me;
    }
    else {
      return false;
    }
  }

  public get canRemoveParticipant(): boolean {
    if (this.member) {
      return this.sessionService.scrumMaster &&
        this.member.participantId !== this.sessionService.myParticipantId &&
        this.member.status === EParticipantStatus.Disconnected;
    }
    else {
      return false;
    }
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionService: SessionService, teamService: TeamService, translateService: TranslateService) {
    this.sessionService = sessionService;
    this.teamService = teamService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public changeNickClick(): void {
    this.teamService.changeNick();
  }

  public changeScrumMasterClick(): void {
    this.teamService.changeScrumMaster();
  }

  public startObserverClick(): void {
    this.teamService.switchObserving(true, this.member?.participantId || '');
  }

  public stopObserverClick(): void {
    this.teamService.switchObserving(false, this.member?.participantId || '');
  }

  public removeParticipantClick(): void {
    this.teamService.removeParticipant(this.member?.participantId || '');
  }
  //#endregion
}
