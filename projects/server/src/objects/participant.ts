import { IParticipant, EParticipantStatus, ERole } from '../../../shared-lib/src';
import { IWebSocket } from '../services/websocket';

export class Participant implements IParticipant {

  //#region Public properties -------------------------------------------------
  public status: EParticipantStatus;
  public observer: boolean;
  public team: string | undefined;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    public nick: string,
    public uuid: string,
    public role: ERole,
    public socket: IWebSocket) {
    this.status = EParticipantStatus.Connected;
    this.observer = true;
  }
  //#endregion
}
