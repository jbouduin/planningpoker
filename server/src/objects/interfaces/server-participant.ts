import { IWebSocket } from '../../services/websocket.js';
import { ParticipantDto } from 'shared-lib';

export interface IServerParticipant extends ParticipantDto {
  socket: IWebSocket;
  readonly self: ParticipantDto;
}
