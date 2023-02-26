import { IParticipant, EParticipantStatus, ERole } from '../../../shared-lib/src';
import { IWebSocket } from '../services/websocket';

// TODO NOW differentiate between IParticipant (the dto and the one used on the server)
export class Participant implements IParticipant {

  //#region Public properties -------------------------------------------------
  public status: EParticipantStatus;
  public observer: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    public nick: string,
    public participantId: string,
    public role: ERole,
    public socket: IWebSocket) {
    this.status = EParticipantStatus.Connected;
    this.observer = true;
  }
  //#endregion
}
