import { ParticipantDto, EParticipantState, ERole } from 'shared-lib';

export class Member {
  //#region Public properties -------------------------------------------------
  public readonly state: EParticipantState;
  public readonly nick: string;
  public readonly participantId: string;
  public readonly role: ERole;
  public readonly me: boolean;
  public readonly observer: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participant: ParticipantDto, me: boolean) {
    this.state = participant.state;
    this.nick = participant.nick;
    this.participantId = participant.participantId;
    this.role = participant.role;
    this.observer = participant.observer;
    this.me = me;
  }
  //#endregion
}
