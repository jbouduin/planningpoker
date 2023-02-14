import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { ConfirmationDialogComponent, ConfirmationDialogParams, ConnectionService, LocalStorageService, SnackbarService } from '@app/@shared';
import { EMemberStatusChange, EParticipantStatus, ERole, EServerMessageType, IInitMessage, IMemberChangedMessage, IMemberListMessage, IMemberStatusChange, IObserverChange, IParticipant, ISelfMessage, ITeamNameMessage, ServerMessage } from '@shared-lib';
import { ChangeNickDialogComponent } from '../components/change-nick-dialog/change-nick-dialog.component';
import { ChangeScrumMasterDialogComponent } from '../components/change-scrum-master-dialog/change-scrum-master-dialog.component';
import { ChangeNickMessage, LeaveMessage } from '../messages';
import { ChangeScrumMasterMessage } from '../messages/change-scrum-master.message';
import { ObserveMessage } from '../messages/observe-message';
import { PauseMessage } from '../messages/pause.message';
import { Member } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  //#region private methods ---------------------------------------------------
  private readonly connectionService: ConnectionService;
  private readonly dialog: MatDialog;
  private readonly localStorageService: LocalStorageService;
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private allMembers: Map<string, Member>;
  private _me: Member;
  //#endregion

  //#region public properties -------------------------------------------------
  public teamName: string;
  //#endregion

  //#region getters/setters ---------------------------------------------------
  public get me(): Member {
    return this._me;
  }

  private set me(value: Member) {
    this._me = value;
    this.allMembers.set(value.uuid, value);
  }

  public get developers(): Array<Member> {
    return Array.from(this.allMembers.values())
      .filter((m: Member) => !m.observer && (m.role !== ERole.ScrumMaster) && (m.role !== ERole.Unknown));
  }

  public get estimatingMembers(): Array<Member> {
    return Array.from(this.allMembers.values())
      .filter((m: Member) => !m.observer && (m.role !== ERole.Unknown) && m.status === EParticipantStatus.Connected);
  }

  public get observers(): Array<Member> {
    return Array.from(this.allMembers.values())
      .filter((m: Member) => m.observer && (m.role !== ERole.Unknown && m.role !== ERole.ScrumMaster));
  }

  public get canPoker(): boolean {
    return this.me !== null && !this.me.observer;
  }

  public get scrumMaster(): Member | undefined {
    return Array.from(this.allMembers.values()).find((m: Member) => m.role === ERole.ScrumMaster)
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    connectionService: ConnectionService,
    dialog: MatDialog,
    localStorageService: LocalStorageService,
    snackbarService: SnackbarService,
    translateService: TranslateService) {

    this.connectionService = connectionService;
    this.dialog = dialog;
    this.localStorageService = localStorageService;
    this.snackbarService = snackbarService;
    this.translateService = translateService;

    this.allMembers = new Map<string, Member>();
    this.teamName = '';
    this._me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, uuid: '' }, true);
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public changeNick(): void {
    const dialogRef = this.dialog.open(ChangeNickDialogComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result) {
        const message = new ChangeNickMessage(this.me.uuid, result);
        this.connectionService.sendMessage(message);
      }
    });
  }

  public changeScrumMaster(): void {
    const dialogRef = this.dialog.open(ChangeScrumMasterDialogComponent, {
      width: '350px',
      data: Array.from(this.allMembers.values()).filter((member: Member) => !member.me)
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result) {
        const message = new ChangeScrumMasterMessage(this.me.uuid, result);
        this.connectionService.sendMessage(message);
      }
    });
  }

  public getMember(uuid: string): Member | undefined {
    return this.allMembers.get(uuid);
  }

  public handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Self:
        if (this.me.role === ERole.Developer && (<ISelfMessage>message).data.role === ERole.ScrumMaster) {
          this.snackbarService.showInfo(
            this.translateService.instant('Game.Snackbar.You_are_now_scrum-master')
          );
        }
        this.me = new Member((<ISelfMessage>message).data, true);
        this.localStorageService.nick = this.me.nick;
        this.localStorageService.uuid = this.me.uuid;
        if (this.me.status === EParticipantStatus.Paused) {
          this.connectionService.disconnect();
        }
        break;
      case EServerMessageType.Init:
        this.me = new Member((<IInitMessage>message).data, true);
        this.localStorageService.uuid = this.me.uuid;
        break;
      case EServerMessageType.EndSession:
        this.handleEndSession();
        this.resetMe();
        break;
      case EServerMessageType.Left:
        this.resetMe();
        break;
      case EServerMessageType.ServerReset:
        this.handleServerReset();
        this.resetMe();
        break;
      case EServerMessageType.MemberChanged:
        this.handleMemberChanged((<IMemberChangedMessage>message).data);
        break;
      case EServerMessageType.MemberList:
        this.allMembers.clear();
        this.allMembers.set(this.me.uuid, this.me);
        (<IMemberListMessage>message).data.forEach(
          (participant: IParticipant) => this.allMembers.set(participant.uuid, new Member(participant, participant.uuid === this.me?.uuid))
        );
        break;
      case EServerMessageType.TeamIdle:
        this.handleTeamIdle();
        this.resetMe();
        break;
      case EServerMessageType.TeamName:
        this.teamName = (<ITeamNameMessage>message).data;
        this.localStorageService.team = this.teamName;
        break;
    }
  }

  public leave(): void {
    if (this.me.role === ERole.ScrumMaster) {
      const params = new ConfirmationDialogParams();
      params.cancelButtonLabel = this.translateService.instant('Dialog.ButtonLabel.No');
      params.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.Yes');
      params.text = this.translateService.instant('Dialog.Confirm.Text.End_Session');
      params.title = this.translateService.instant('Dialog.Confirm.Title.End_session');

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '250px',
        data: params
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.sendLeaveMessage(this.me.uuid);
        }
      });
    } else {
      this.sendLeaveMessage(this.me.uuid);
    }
  }

  public pause(): void {
    if (this.me.role === ERole.ScrumMaster) {
      const params = new ConfirmationDialogParams();
      params.showCancelButton = false;
      params.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.OK');
      params.text = this.translateService.instant('Dialog.Confirm.Text.Assign_another_scrum_master_first');
      params.title = this.translateService.instant('Dialog.Confirm.Title.Assign_another_scrum_master_first');

      this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: params
      });
    } else {
      const message = new PauseMessage(this.me.uuid)
      this.connectionService.sendMessage(message);
    }
  }

  public switchObserving(observe: boolean, member: string): void {
    const data: IObserverChange = {
      member: member,
      observer: observe
    };
    const message = new ObserveMessage(this.me.uuid, data);
    this.connectionService.sendMessage(message);
  }
  //#endregion

  //#region private methods -----------------------------------------
  private sendLeaveMessage(uuid: string): void {
    const message = new LeaveMessage(uuid);
    this.connectionService.sendMessage(message);
  }

  private handleMemberChanged(memberChange: IMemberStatusChange): void {
    if (memberChange.memberStatusChange != EMemberStatusChange.Left) {
      this.allMembers.set(
        memberChange.member.uuid,
        new Member(memberChange.member, false)
      );
    } else {
      this.allMembers.delete(memberChange.member.uuid);
    }

    switch (memberChange.memberStatusChange) {
      case EMemberStatusChange.ChangedRole:
        if (memberChange.member.role === ERole.ScrumMaster) {
          this.snackbarService.showInfo(
            this.translateService.instant(
              'Game.Snackbar.$member_is_now_scrum-master',
              { member: memberChange.member.nick }
            )
          );
        }
        break;
      case EMemberStatusChange.Disconnected:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_was_disconnected',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberStatusChange.Joined:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_has_joined',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberStatusChange.Left:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_has_left',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberStatusChange.Paused:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_is_having_a_break',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberStatusChange.Rejoined:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_is_back',
            { member: memberChange.member.nick }
          )
        );
        break;
    }

  }

  private handleEndSession(): void {
    if (this.me.role !== ERole.ScrumMaster) {
      const params = new ConfirmationDialogParams();
      params.showCancelButton = false;
      params.title = this.translateService.instant('Dialog.Title.Session_ended');
      params.text = this.translateService.instant('Dialog.Text.The_scrummaster_has_ended_the_session');

      this.dialog.open(ConfirmationDialogComponent, {
        width: '250px',
        data: params
      });
    }
  }

  private handleServerReset(): void {
    const params = new ConfirmationDialogParams();
    params.showCancelButton = false;
    params.title = this.translateService.instant('Dialog.Title.Server_reset');
    params.text = this.translateService.instant('Dialog.Text.The_server_has_been_reset.');
    this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: params
    });
  }

  private handleTeamIdle(): void {
    const params = new ConfirmationDialogParams();
    params.showCancelButton = false;
    params.title = this.translateService.instant('Dialog.Title.Team_idle');
    params.text = this.translateService.instant('Dialog.Text.The_was_idle_for_to_long.');
    this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: params
    });
  }

  private resetMe(): void {
    this._me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, uuid: '' }, true);
    this.localStorageService.clear();
    this.allMembers.clear();
    this.teamName = '';
  }
  //#endregion
}
