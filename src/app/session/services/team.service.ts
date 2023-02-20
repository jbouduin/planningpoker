import { Clipboard } from '@angular/cdk/clipboard';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '@env/environment';
import { ConnectionService, LocalStorageService, MessageBoxComponent, MessageBoxParams, SnackbarService } from '@shared';
import { EMemberStatusChange, EParticipantStatus, ERole, EServerMessageType, IMemberChangedMessage, IMemberListMessage, IMemberStatusChange, IObserverChange, IParticipant, ISelfMessage, ITeamNameMessage, ServerMessage } from '@shared-lib';
import { ChangeNickMessage, LeaveMessage } from '@shared/messages';
import { ChangeScrumMasterMessage } from '@shared/messages/change-scrum-master.message';
import { ObserveMessage } from '@shared/messages/observe-message';
import { PauseMessage } from '@shared/messages/pause.message';
import { Member } from '@shared/services/member';
import { ChangeNickDialogComponent } from '../components/change-nick-dialog/change-nick-dialog.component';
import { ChangeScrumMasterDialogComponent } from '../components/change-scrum-master-dialog/change-scrum-master-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  //#region private methods ---------------------------------------------------
  private readonly clipboard: Clipboard;
  private readonly connectionService: ConnectionService;
  private readonly dialog: MatDialog;
  private readonly localStorageService: LocalStorageService;
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private allMembers: Map<string, Member>;
  private myUuid: string;
  //#endregion

  //#region public properties -------------------------------------------------
  public teamName: string;
  //#endregion

  //#region getters/setters ---------------------------------------------------
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
    const me = this.allMembers.get(this.myUuid);
    return me !== undefined && !me.observer;
  }

  public get scrumMaster(): Member | undefined {
    return Array.from(this.allMembers.values()).find((m: Member) => m.role === ERole.ScrumMaster)
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    clipboard: Clipboard,
    connectionService: ConnectionService,
    dialog: MatDialog,
    localStorageService: LocalStorageService,
    snackbarService: SnackbarService,
    translateService: TranslateService) {
    this.clipboard = clipboard;
    this.connectionService = connectionService;
    this.dialog = dialog;
    this.localStorageService = localStorageService;
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.allMembers = new Map<string, Member>();
    this.teamName = '';
    this.myUuid = '';
    this.connectionService.incomingMessage.subscribe((serverMessage: ServerMessage) => this.handleServerMessage(serverMessage));
    this.connectionService.reset.subscribe(() => this.resetService());
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public copyTeamLinkToClipBoard(): void {
    this.clipboard.copy(`${environment.host}/home?team=${this.teamName}`);
    const params = new MessageBoxParams();
    params.showCancelButton = false;
    params.okButtonLabel = this.translateService.instant('Button.Generic.Label.OK');
    params.text = this.translateService.instant('MessageBox.Link_to_team_is_copied_to_clipboard.Text');
    params.title = this.translateService.instant('MessageBox.Link_to_team_is_copied_to_clipboard.Title');

    this.dialog.open(MessageBoxComponent, {
      width: '350px',
      data: params
    });
  }

  public changeNick(): void {
    const dialogRef = this.dialog.open(ChangeNickDialogComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result) {
        const message = new ChangeNickMessage(this.myUuid, result);
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
        const message = new ChangeScrumMasterMessage(this.myUuid, result);
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
        this.handleSelf(new Member((<ISelfMessage>message).data, true));
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.Left:
      case EServerMessageType.ServerReset:
      case EServerMessageType.TeamIdle:
        this.resetService();
        break;
        ;
      case EServerMessageType.MemberChanged:
        this.handleMemberChanged((<IMemberChangedMessage>message).data);
        break;
      case EServerMessageType.MemberList:
        const me = this.allMembers.get(this.myUuid);
        this.allMembers.clear();
        if (me) {
          this.allMembers.set(this.myUuid, me);
        }
        (<IMemberListMessage>message).data.forEach(
          (participant: IParticipant) => this.allMembers.set(participant.uuid, new Member(participant, participant.uuid === this.myUuid))
        );
        break;
      case EServerMessageType.TeamName:
        this.teamName = (<ITeamNameMessage>message).data;
        this.localStorageService.team = this.teamName;
        break;
    }
  }

  // TODO now move this to session
  public leave(): void {
    const me = this.allMembers.get(this.myUuid);
    if (me && me.role === ERole.ScrumMaster) {
      const params = new MessageBoxParams();
      params.cancelButtonLabel = this.translateService.instant('Button.Generic.Label.No');
      params.okButtonLabel = this.translateService.instant('Button.Generic.Label.Yes');
      params.text = this.translateService.instant('MessageBox.Do_you_want_to_end_the_session.Text');
      params.title = this.translateService.instant('MessageBox.Do_you_want_to_end_the_session.Title');

      const dialogRef = this.dialog.open(MessageBoxComponent, {
        width: '250px',
        data: params
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.sendLeaveMessage(this.myUuid);
        }
      });
    } else {
      this.sendLeaveMessage(this.myUuid);
    }
  }

  // TODO now move this to session
  public pause(): void {
    const me = this.allMembers.get(this.myUuid);
    if (me && me.role === ERole.ScrumMaster) {
      const params = new MessageBoxParams();
      params.showCancelButton = false;
      params.okButtonLabel = this.translateService.instant('Button.Generic.Label.OK');
      params.text = this.translateService.instant('MessageBox.Assign_another_scrum_master_first.Text');
      params.title = this.translateService.instant('MessageBox.Assign_another_scrum_master_first.Title');

      this.dialog.open(MessageBoxComponent, {
        width: '350px',
        data: params
      });
    } else {
      const message = new PauseMessage(this.myUuid)
      this.connectionService.sendMessage(message);
    }
  }

  public switchObserving(observe: boolean, member: string): void {
    const data: IObserverChange = {
      member: member,
      observer: observe
    };
    const message = new ObserveMessage(this.myUuid, data);
    this.connectionService.sendMessage(message);
  }
  //#endregion

  //#region private methods -----------------------------------------
  private sendLeaveMessage(uuid: string): void {
    const message = new LeaveMessage(uuid, uuid);
    this.connectionService.sendMessage(message);
  }

  private handleSelf(me: Member): void {
    this.myUuid = me.uuid;
    this.allMembers.set(me.uuid, me);
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

  private resetService(): void {
    this.localStorageService.clear();
    this.allMembers.clear();
    this.teamName = '';
    this.myUuid = '';
  }
  //#endregion
}
