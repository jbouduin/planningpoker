import { EServerMessageType, IPingMessage } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class PingMessage extends ServerMessage<void> implements IPingMessage {
  public constructor() {
    super(EServerMessageType.Ping, undefined);
  }
}
