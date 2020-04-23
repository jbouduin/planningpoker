import { DtoParticipant, ParticipantStatus, Role } from '../../../../shared-lib/lib';
import { WebSocket } from '../websocket';

export class Participant implements DtoParticipant {

  public status: ParticipantStatus;

  constructor(
    public nick: string,
    public uuid: string,
    public role: Role,
    public socket: WebSocket) {
    this.status = ParticipantStatus.Connected;
  }
}
