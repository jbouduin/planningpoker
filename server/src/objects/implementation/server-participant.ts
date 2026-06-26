import { EParticipantState, ERole, ParticipantDto } from 'shared-lib';
import { IWebSocket } from '../../services/websocket.js';
import type { IServerParticipant } from '../interfaces/index.js';

export class ServerParticipant implements IServerParticipant {
  //#region private properties ------------------------------------------------
  private readonly _participant: ParticipantDto;
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  public socket: IWebSocket;
  public get self(): ParticipantDto {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._participant.role;
  }

  public set role(value: ERole) {
    this._participant.role = value;
  }

  public get state(): EParticipantState {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._participant.state;
  }

  public set state(value: EParticipantState) {
    this._participant.state = value;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participant: ParticipantDto, socket: IWebSocket) {
    this._participant = participant;
    this.socket = socket;
  }
  //#endregion
}
