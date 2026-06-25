import { IClearEstimationsMessage, EServerMessageType } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class ClearEstimationsMessage extends ServerMessage<void> implements IClearEstimationsMessage {
  public constructor() {
    super(EServerMessageType.ClearEstimations, undefined);
  }
}
