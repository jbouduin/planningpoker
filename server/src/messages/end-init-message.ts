import { EServerMessageType, IEndInitMessage } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class EndInitMessage extends ServerMessage<void> implements IEndInitMessage {
  public constructor() {
    super(EServerMessageType.EndInit, undefined);
  }
}
