import { EServerMessageType, EndHandshakeMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class EndHandshakeMessage extends ServerMessage<void> implements EndHandshakeMessageDto {
  public constructor() {
    super(EServerMessageType.EndHandshake, undefined);
  }
}
