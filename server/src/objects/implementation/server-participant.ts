import { EParticipantState, ERole, ParticipantDto } from 'shared-lib';
import { IWebSocket } from '../../services/websocket';
import { IServerParticipant } from '../interfaces/server-participant';

export class ServerParticipant implements IServerParticipant {
  //#region private properties ------------------------------------------------
  private readonly _participant: ParticipantDto;
  //#endregion

  //#region IServerParticipant properties -------------------------------------
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
    return this._participant.role;
  }

  public set role(value: ERole) {
    this._participant.role = value;
  }

  public get state(): EParticipantState {
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
