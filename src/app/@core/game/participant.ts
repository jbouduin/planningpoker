import { DtoParticipant, Role } from '../../../../projects/shared-lib/lib';

export class Participant implements DtoParticipant {

  public connected: boolean;
  public nick: string;
  public uuid: string;
  public role: Role;
  public me: boolean;

  public constructor(dtoParticipant: DtoParticipant, me: boolean) {
    this.connected = dtoParticipant.connected;
    this.nick = dtoParticipant.nick;
    this.uuid = dtoParticipant.uuid;
    this.role = dtoParticipant.role;
    this.me = me;
  }
}
