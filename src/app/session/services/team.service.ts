import { Clipboard } from '@angular/cdk/clipboard';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { EMemberChangeType, EParticipantStatus, ERole, EServerMessageType, IMemberChangeMessage, IMemberListMessage, IMemberChange, IObserverChange, IParticipant, ISelfMessage, ITeamNameMessage, AServerMessage } from '@shared-lib';

import { environment } from '@env/environment';
import { MessageBoxComponent, MessageBoxParams } from '@shared/components';
import { ChangeNickMessage, ChangeScrumMasterMessage, ObserveMessage, RemoveMessage } from '@shared/messages';
import { LocalStorageService, Member, SessionService, SnackbarService } from '@shared/services';
import { ChangeNickDialogComponent, ChangeScrumMasterDialogComponent } from '../components';


@Injectable({
  providedIn: 'root'
})
export class TeamService {

  //#region private methods ---------------------------------------------------
  private readonly clipboard: Clipboard;
  private readonly sessionService: SessionService;
  private readonly dialog: MatDialog;
  private readonly localStorageService: LocalStorageService;
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private allMembers: Map<string, Member>;
  private myParticipantId: string;
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
    const me = this.allMembers.get(this.myParticipantId);
    return me !== undefined && !me.observer;
  }

  public get scrumMaster(): Member | undefined {
    return Array.from(this.allMembers.values()).find((m: Member) => m.role === ERole.ScrumMaster)
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    clipboard: Clipboard,
    sessionService: SessionService,
    dialog: MatDialog,
    localStorageService: LocalStorageService,
    snackbarService: SnackbarService,
    translateService: TranslateService) {
    this.clipboard = clipboard;
    this.sessionService = sessionService;
    this.dialog = dialog;
    this.localStorageService = localStorageService;
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.allMembers = new Map<string, Member>();
    this.teamName = '';
    this.myParticipantId = '';
    this.sessionService.incomingMessage.subscribe((serverMessage: AServerMessage) => this.handleServerMessage(serverMessage));
    this.sessionService.reset.subscribe(() => this.resetService());
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
        const message = new ChangeNickMessage(this.myParticipantId, result);
        this.sessionService.sendMessage(message);
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
        const message = new ChangeScrumMasterMessage(this.myParticipantId, result);
        this.sessionService.sendMessage(message);
      }
    });
  }

  public getMember(participantId: string): Member | undefined {
    return this.allMembers.get(participantId);
  }

  public removeParticipant(participantId: string): void {
    const message = new RemoveMessage(this.myParticipantId, participantId);
    this.sessionService.sendMessage(message);
  }

  public switchObserving(observe: boolean, member: string): void {
    const data: IObserverChange = {
      member: member,
      observer: observe
    };
    const message = new ObserveMessage(this.myParticipantId, data);
    this.sessionService.sendMessage(message);
  }
  //#endregion

  //#region private methods -----------------------------------------
  private handleServerMessage(message: AServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Self:
        this.handleSelf(new Member((<ISelfMessage>message).data, true));
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.ServerReset:
      case EServerMessageType.TeamIdle:
        this.resetService();
        break;
      case EServerMessageType.MemberChanged:
        this.handleMemberChanged((<IMemberChangeMessage>message).data);
        break;
      case EServerMessageType.MemberList:
        this.handleMemberList((<IMemberListMessage>message).data);
        break;
      case EServerMessageType.TeamName:
        this.teamName = (<ITeamNameMessage>message).data;
        this.localStorageService.teamName = this.teamName;
        break;
    }
  }

  private handleSelf(me: Member): void {
    this.myParticipantId = me.participantId;
    this.allMembers.set(me.participantId, me);
    if (me.status === EParticipantStatus.Left) {
      this.resetService();
    }
  }

  private handleMemberChanged(memberChange: IMemberChange): void {
    if (memberChange.memberStatusChange != EMemberChangeType.Left) {
      this.allMembers.set(
        memberChange.member.participantId,
        new Member(memberChange.member, false)
      );
    } else {
      this.allMembers.delete(memberChange.member.participantId);
    }

    switch (memberChange.memberStatusChange) {
      case EMemberChangeType.ChangedRole:
        if (memberChange.member.role === ERole.ScrumMaster) {
          this.snackbarService.showInfo(
            this.translateService.instant(
              'Game.Snackbar.$member_is_now_scrum-master',
              { member: memberChange.member.nick }
            )
          );
        }
        break;
      case EMemberChangeType.Disconnected:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_was_disconnected',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberChangeType.Joined:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_has_joined',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberChangeType.Left:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_has_left',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberChangeType.Paused:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_is_having_a_break',
            { member: memberChange.member.nick }
          )
        );
        break;
      case EMemberChangeType.Rejoined:
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$member_is_back',
            { member: memberChange.member.nick }
          )
        );
        break;
    }
  }

  private handleMemberList(members: Array<IParticipant>): void {
    const me = this.allMembers.get(this.myParticipantId);
    this.allMembers.clear();
    if (me) {
      this.allMembers.set(this.myParticipantId, me);
    }
    members.forEach(
      (participant: IParticipant) => this.allMembers.set(participant.participantId, new Member(participant, participant.participantId === this.myParticipantId))
    );
  }

  private resetService(): void {
    this.localStorageService.clear();
    this.allMembers.clear();
    this.teamName = '';
    this.myParticipantId = '';
  }
  //#endregion
}
