import { EServerMessageType, EstimationDto, IEstimationListMessage } from 'shared-lib';
import { ServerMessage } from './server-message';

export class EstimationListMessage extends ServerMessage<Array<EstimationDto>> implements IEstimationListMessage {
  public constructor(data: Array<EstimationDto>) {
    super(EServerMessageType.EstimationList, data);
  }
}
