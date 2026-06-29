import { EServerMessageType, ParticipantChangedMessageDto, ParticipantChangeDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class ParticipantChangedMessage
  extends ServerMessage<ParticipantChangeDto>
  implements ParticipantChangedMessageDto
{
  public constructor(data: ParticipantChangeDto) {
    super(EServerMessageType.ParticipantChanged, data);
  }
}
