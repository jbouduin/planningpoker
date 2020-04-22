import { DtoParticipant, ParticipantStatus, Role } from '../../../../shared-lib/lib';

export class Participant implements DtoParticipant {

  public status: ParticipantStatus;

  constructor(
    public nick: string,
    public uuid: string,
    public role: Role,
    public socket: any) {
    // TODO: (#691) Socket
    this.status = ParticipantStatus.Connected;
  }
}
