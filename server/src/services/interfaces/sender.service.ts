import { AServerMessage } from 'shared-lib';
import type { IServerParticipant } from '../../objects/interfaces/index.js';
import { IWebSocket } from '../websocket.js';

export interface ISenderService {
  sendToParticipant(to: IServerParticipant, message: AServerMessage): void;
  sendToSocket(socket: IWebSocket, message: AServerMessage): void;
}
