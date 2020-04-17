import { DtoParticipant, Role } from '../../../../shared-lib/lib';

export class Participant implements DtoParticipant {

  public connected: boolean;

  constructor(
    public nick: string,
    public uuid: string,
    public role: Role,
    public socket: any) {
    this.connected = true;
  }
}
