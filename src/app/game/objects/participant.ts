import { DtoParticipant, ParticipantStatus, Role } from '@shared-lib';

export class Participant {

  // <editor-fold desc='Public properties'>
  public status: ParticipantStatus;
  public nick: string;
  public uuid: string;
  public role: Role;
  public me: boolean;
  public observer: boolean;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public static createParticipant(dtoParticipant: DtoParticipant, me: boolean): Participant {
    return new Participant(dtoParticipant, me);
  }

  private constructor(dtoParticipant: DtoParticipant, me: boolean) {
    this.status = dtoParticipant.status;
    this.nick = dtoParticipant.nick;
    this.uuid = dtoParticipant.uuid;
    this.role = dtoParticipant.role;
    this.observer = dtoParticipant.observer;
    this.me = me;

  }
  // </editor-fold>
}
