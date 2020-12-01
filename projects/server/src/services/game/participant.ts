import { DtoParticipant, ParticipantStatus, Role } from '../../../../shared-lib/lib';
import { WebSocket } from '../websocket';

export class Participant implements DtoParticipant {

  //#region  Public properties
  public status: ParticipantStatus;
  public observer: boolean;
  //#endregion

  //#region  Constructor & C°

  public constructor(
    public nick: string,
    public uuid: string,
    public role: Role,
    public socket: WebSocket) {
    this.status = ParticipantStatus.Connected;
    this.observer = true;
  }
  //#endregion
}
