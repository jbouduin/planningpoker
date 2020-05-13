import { DtoParticipant, ParticipantStatus, Role } from '../../../../shared-lib/lib';
import { WebSocket } from '../websocket';

export class Participant implements DtoParticipant {

  // <editor-fold desc='Public properties'>
  public status: ParticipantStatus;
  public observer: boolean;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>

  public constructor(
    public nick: string,
    public uuid: string,
    public role: Role,
    public socket: WebSocket) {
    this.status = ParticipantStatus.Connected;
    this.observer = true;
  }
  // </editor-fold>
}
