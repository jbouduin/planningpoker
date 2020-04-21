import { DtoParticipant, ParticipantStatus, Role } from '../../../../projects/shared-lib/lib';

export class Participant implements DtoParticipant {

  public status: ParticipantStatus;
  public nick: string;
  public uuid: string;
  public role: Role;
  public me: boolean;

  public constructor(dtoParticipant: DtoParticipant, me: boolean) {
    this.status = dtoParticipant.status;
    this.nick = dtoParticipant.nick;
    this.uuid = dtoParticipant.uuid;
    this.role = dtoParticipant.role;
    this.me = me;
  }
}
