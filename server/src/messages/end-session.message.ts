import { EServerMessageType, ESessionEndedReason, SessionEndedMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class SessionEndedMessage extends ServerMessage<ESessionEndedReason> implements SessionEndedMessageDto {
  public constructor(reason: ESessionEndedReason) {
    super(EServerMessageType.SessionEnded, reason);
  }
}
