import { ParticipantDto, EParticipantState, ERole } from 'shared-lib';

export class Member {
  // TODO check if these props can be readonly
  //#region Public properties -------------------------------------------------
  public state: EParticipantState;
  public nick: string;
  public participantId: string;
  public role: ERole;
  public me: boolean;
  public observer: boolean;
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
