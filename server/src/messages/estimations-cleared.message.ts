import { EServerMessageType, EstimationsClearedMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class EstimationsClearedMessage extends ServerMessage<void> implements EstimationsClearedMessageDto {
  public constructor() {
    super(EServerMessageType.EstimationsCleared, undefined);
  }
}
