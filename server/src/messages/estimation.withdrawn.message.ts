import { EServerMessageType, EstimationWithdrawnMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class EstimationWithdrawnMessage extends ServerMessage<string> implements EstimationWithdrawnMessageDto {
  public constructor(data: string) {
    super(EServerMessageType.EstimationWithdrawn, data);
  }
}
