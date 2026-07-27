import { EServerMessageType, SessionEndedDto, SessionEndedMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class SessionEndedMessage extends ServerMessage<SessionEndedDto> implements SessionEndedMessageDto {
  public constructor(data: SessionEndedDto) {
    super(EServerMessageType.SessionEnded, data);
  }
}
