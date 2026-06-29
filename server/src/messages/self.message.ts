import { EServerMessageType, ParticipantDto, SelfMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class SelfMessage extends ServerMessage<ParticipantDto> implements SelfMessageDto {
  public constructor(data: ParticipantDto) {
    super(EServerMessageType.Self, data);
  }
}
