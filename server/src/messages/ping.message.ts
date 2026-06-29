import { EServerMessageType, PingMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class PingMessage extends ServerMessage<void> implements PingMessageDto {
  public constructor() {
    super(EServerMessageType.Ping, undefined);
  }
}
