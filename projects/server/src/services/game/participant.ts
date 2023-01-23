import { IParticipant, EParticipantStatus, ERole } from '../../../../shared-lib/lib';
import { WebSocket } from '../websocket';

export class Participant implements IParticipant {

  //#region Public properties -------------------------------------------------
  public status: EParticipantStatus;
  public observer: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    public nick: string,
    public uuid: string,
    public role: ERole,
    public socket: WebSocket) {
    this.status = EParticipantStatus.Connected;
    this.observer = true;
  }
  //#endregion
}
