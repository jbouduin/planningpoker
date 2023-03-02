import { IParticipant, EParticipantStatus, ERole } from '@shared-lib';

export class Member {

  //#region Public properties -------------------------------------------------
  public status: EParticipantStatus;
  public nick: string;
  public participantId: string;
  public role: ERole;
  public me: boolean;
  public observer: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participant: IParticipant, me: boolean) {
    this.status = participant.status;
    this.nick = participant.nick;
    this.participantId = participant.participantId;
    this.role = participant.role;
    this.observer = participant.observer;
    this.me = me;
  }
  //#endregion
}
