import { EServerMessageType, IInitMessage, ParticipantDto } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class InitMessage extends ServerMessage<ParticipantDto> implements IInitMessage {
  public constructor(data: ParticipantDto) {
    super(EServerMessageType.Init, data);
  }
}
