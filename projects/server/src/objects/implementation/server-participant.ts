import { IParticipant, EParticipantStatus, ERole } from '../../../../shared-lib/src';
import { IServerParticipant } from '../interfaces/server-participant';
import { IWebSocket } from '../../services/websocket';

export class ServerParticipant implements IServerParticipant {

  //#region private properties ------------------------------------------------
  private readonly _participant: IParticipant;
  //#endregion

  //#region IServerParticipant properties -------------------------------------
  public socket: IWebSocket;
  public get self(): IParticipant {
    return this._participant;
  }

  public get nick(): string {
    return this._participant.nick;
  }

  public set nick(value: string) {
    this._participant.nick = value;
  }

  public get participantId(): string {
    return this._participant.participantId;
  }

  public get observer(): boolean {
    return this._participant.observer;
  }

  public set observer(value: boolean) {
    this._participant.observer = value;
  }

  public get role(): ERole {
    return this._participant.role;
  }

  public set role(value: ERole) {
    this._participant.role = value;
  }

  public get status(): EParticipantStatus {
    return this._participant.status;
  }
  public set status(value: EParticipantStatus) {
    this._participant.status = value;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participant: IParticipant, socket: IWebSocket) {
    this._participant = participant;
    this.socket = socket;
  }



  //#endregion
}
