import { DtoParticipant, ParticipantStatus, Role } from '../../../../shared-lib/lib';
import { WebSocket } from '../websocket';

export class Participant implements DtoParticipant {

  // <editor-fold desc='Public properties'>
  public status: ParticipantStatus;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public static dummyParticipant(socket: WebSocket): Participant {
    const result = new Participant('dummy', '', Role.Unknown, socket);
    result.status = ParticipantStatus.Disconnected;
    return result;
  }

  public constructor(
    public nick: string,
    public uuid: string,
    public role: Role,
    public socket: WebSocket) {
    this.status = ParticipantStatus.Connected;
  }
  // </editor-fold>
}
