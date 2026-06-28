import { EServerMessageType, IEstimationWithdrawnMessage } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class EstimationWithdrawnMessage extends ServerMessage<string> implements IEstimationWithdrawnMessage {
  public constructor(data: string) {
    super(EServerMessageType.EstimationWithdrawn, data);
  }
}
