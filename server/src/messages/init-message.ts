import { EServerMessageType, IInitMessage, ParticipantDto } from 'shared-lib';
import { ServerMessage } from './server-message';

export class InitMessage extends ServerMessage<ParticipantDto> implements IInitMessage {
  public constructor(data: ParticipantDto) {
    super(EServerMessageType.Init, data);
  }
}
