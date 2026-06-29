import { EServerMessageType, EstimationDto, EstimationListMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class EstimationListMessage extends ServerMessage<Array<EstimationDto>> implements EstimationListMessageDto {
  public constructor(data: Array<EstimationDto>) {
    super(EServerMessageType.EstimationList, data);
  }
}
