import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogParams, ConnectionService, EConnectionStatus, SnackbarService } from '@app/@shared';
import { TranslateService } from '@ngx-translate/core';
import { EMemberStatusChange, EParticipantStatus, ERole, EServerMessageType, IInitMessage, IMemberChangedMessage, IMemberListMessage, IMemberStatusChange, IParticipant, ISelfMessage, ITeamNameMessage, ServerMessage } from '@shared-lib';
import { LeaveMessage } from '../messages';
import { Member } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  //#region private methods ---------------------------------------------------
  private readonly connectionService: ConnectionService;
  private readonly dialog: MatDialog;
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private allMembers: Map<string, Member>;
  private _me: Member;
  //#endregion

  //#region public properties -------------------------------------------------
  public teamName: string;
  //#endregion

  //#region getters/setters ---------------------------------------------------
  private get me(): Member {
    return this._me;
  }

  private set me(value: Member) {
    this._me = value;
    this.allMembers.set(value.uuid, value);
  }

  public get developers(): Array<Member> {
    return Array.from(this.allMembers.values())
      .filter((member: Member) => !member.observer && (member.role !== ERole.ScrumMaster) && (member.role !== ERole.Unknown));
  }

  public get estimatingMembers(): Array<Member> {
    return Array.from(this.allMembers.values())
      .filter((member: Member) => !member.observer && (member.role !== ERole.Unknown));
  }

  public get observers(): Array<Member> {
    return Array.from(this.allMembers.values())
      .filter((member: Member) => member.observer && (member.role !== ERole.Unknown));
  }

  public get canPoker(): boolean {
    return this.me !== null && !this.me.observer;
  }

  public get scrumMaster(): Member | undefined {
    return this.me?.role === ERole.ScrumMaster ?
      this.me :
      Array.from(this.allMembers.values()).find((member: Member) => member.role === ERole.ScrumMaster)
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    connectionService: ConnectionService,
    dialog: MatDialog,
    snackbarService: SnackbarService,
    translateService: TranslateService) {
    this.connectionService = connectionService;
    this.dialog = dialog;
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.allMembers = new Map<string, Member>();
    this.teamName = '';
    this._me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, uuid: '' }, true);
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public getMember(uuid: string): Member | undefined {
    return this.allMembers.get(uuid);
  }

  public handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Self:
        this.me = new Member((<ISelfMessage>message).data, true);
        break;
      case EServerMessageType.Init:
        this.me = new Member((<IInitMessage>message).data, true);
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.Reset:
        this._me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, uuid: '' }, true);
        this.allMembers.clear();
        this.teamName = '';
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
      case EServerMessageType.TeamName:
        this.teamName = (<ITeamNameMessage>message).data;
        break;
    }
  }

  public leave(): void {
    if (this.scrumMaster && this.scrumMaster.me) {
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
  //#endregion

  //#region private methods -----------------------------------------
  private sendLeaveMessage(uuid: string): void {
    const message = new LeaveMessage(uuid);
    this.connectionService.sendMessage(message);
    // if we are connected, we are just leaving the game
    // if not we are leaving a game we have been disconnected from before
    if (this.connectionService.connectionStatus == EConnectionStatus.Connected) {
      this.connectionService.sendMessage(message);
    } else {
      // TODO this.connectionService.connect(createConnection(this.game.team, message);
    }
  }

  private handleMemberChanged(memberChange: IMemberStatusChange): void {
    // TODO  this.dumpParticipant(participant);
    let message = '';
    if (memberChange.memberStatusChange != EMemberStatusChange.Left) {
      this.allMembers.set(
        memberChange.member.uuid,
        new Member(memberChange.member, false)
      );
    } else {
      this.allMembers.delete(memberChange.member.uuid);
    }

    switch (memberChange.memberStatusChange) {
      case EMemberStatusChange.Disconnected:
        message = this.translateService.instant(
          'Game.Snackbar.$member_was_disconnected',
          { member: memberChange.member.nick }
        );
        break;
      case EMemberStatusChange.Joined:
        message = this.translateService.instant(
          'Game.Snackbar.$member_has_joined',
          { member: memberChange.member.nick }
        );
        break;
      case EMemberStatusChange.Left:
        message = this.translateService.instant(
          'Game.Snackbar.$member_has_left',
          { member: memberChange.member.nick }
        );
        break;
      case EMemberStatusChange.Paused:
        message = this.translateService.instant(
          'Game.Snackbar.$member_is_having_a_break',
          { member: memberChange.member.nick }
        );
        break;
      case EMemberStatusChange.Rejoined:
        message = this.translateService.instant(
          'Game.Snackbar.$member_is_back',
          { member: memberChange.member.nick }
        );
        break;
      // case EMemberStatusChange.NickChanged:
      default:
        return;
    }
    this.snackbarService.showInfo(message);
  }
  //#endregion
}
