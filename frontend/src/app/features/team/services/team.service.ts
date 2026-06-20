import { inject, Service, signal, WritableSignal } from '@angular/core';
import { filter } from 'rxjs';
import {
  AServerMessage,
  EMemberChangeType,
  EParticipantStatus,
  EServerMessageType,
  IMemberChangeMessage,
  IMemberListMessage,
  IParticipant
} from 'shared-lib';
import { Member, SocketService } from '../../../core';
import { isTeamMessage, TeamMessage } from '../../../core/messaging';

@Service()
export class TeamService {
  //#region private readonly properties ---------------------------------------
  private readonly socketSvc: SocketService;
  //#endregion

  //#region Signales ----------------------------------------------------------
  public members: WritableSignal<Array<IParticipant>>;
  //#region

  //#region Constructor & C° -------------------------------------------------
  public constructor() {
    this.socketSvc = inject(SocketService);
    this.members = signal<Array<IParticipant>>(new Array<IParticipant>());
    this.socketSvc.incomingMessage
      .pipe(filter((msg: AServerMessage) => isTeamMessage(msg)))
      .subscribe((msg: TeamMessage) => this.handleServerMessage(msg));
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleServerMessage(message: TeamMessage): void {
    switch (message.type) {
      case EServerMessageType.EndSession:
        this.resetService();
        break;
      case EServerMessageType.MemberList:
        this.handleMemberListMessage(<IMemberListMessage>message);
        break;
      case EServerMessageType.MemberChanged:
        this.handleMemberChanged(<IMemberChangeMessage>message);
        break;
      case EServerMessageType.ServerReset:
        this.resetService();
        break;
      case EServerMessageType.TeamIdle:
        this.resetService();
        break;
    }
  }

  private handleMemberListMessage(message: IMemberListMessage): void {
    this.members.set(message.data);
  }

  private handleMemberChanged(message: IMemberChangeMessage): void {
    const participant = message.data.member;
    switch (message.data.memberStatusChange) {
      case EMemberChangeType.ChangedNick:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, nick: participant.nick } : p
          )
        );
        break;
      case EMemberChangeType.ChangedRole:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, role: participant.role } : p
          )
        );
        break;
      case EMemberChangeType.Disconnected:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantStatus.Disconnected } : p
          )
        );
        break;
      case EMemberChangeType.Joined:
        this.members.update((current: Array<IParticipant>) => [...current, participant]);
        break;
      case EMemberChangeType.Left:
        this.members.update((current: Array<IParticipant>) =>
          current.filter((p: IParticipant) => p.participantId !== participant.participantId)
        );
        break;
      case EMemberChangeType.Observe:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, observer: participant.observer } : p
          )
        );
        break;
      case EMemberChangeType.Paused:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantStatus.Paused } : p
          )
        );
        break;
      case EMemberChangeType.Rejoined:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantStatus.Connected } : p
          )
        );
        break;
    }
  }

  private resetService(): void {
    this.members.set(new Array<Member>());
  }
  //#endregion
  /**
   * should handle:
   * MemberList
   * MemberChanged
   * TeamIdle
   * ServerReset
   */
}
