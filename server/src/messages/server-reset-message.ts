import { EServerMessageType, IServerResetMessage } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class ServerResetMessage extends ServerMessage<void> implements IServerResetMessage {
  public constructor() {
    super(EServerMessageType.ServerReset, undefined);
  }
}
