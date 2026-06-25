import { EServerMessageType, IEndSessionMessage } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class EndSessionMessage extends ServerMessage<void> implements IEndSessionMessage {
  public constructor() {
    super(EServerMessageType.EndSession, undefined);
  }
}
