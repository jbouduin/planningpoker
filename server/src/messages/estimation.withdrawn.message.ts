import { EServerMessageType, EstimationWithdrawnDto, EstimationWithdrawnMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class EstimationWithdrawnMessage
  extends ServerMessage<EstimationWithdrawnDto>
  implements EstimationWithdrawnMessageDto
{
  public constructor(data: EstimationWithdrawnDto) {
    super(EServerMessageType.EstimationWithdrawn, data);
  }
}
