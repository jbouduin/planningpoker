import { EServerMessageType, ISelfMessage, ParticipantDto } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class SelfMessage extends ServerMessage<ParticipantDto> implements ISelfMessage {
  public constructor(data: ParticipantDto) {
    super(EServerMessageType.Self, data);
  }
}
