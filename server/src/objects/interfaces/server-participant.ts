import { IWebSocket } from '../../services/websocket';
import { IParticipant } from 'shared-lib';

export interface IServerParticipant extends IParticipant {
  socket: IWebSocket;
  readonly self: IParticipant;
}
