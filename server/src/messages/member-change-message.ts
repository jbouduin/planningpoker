import { EServerMessageType, IParticipantChangedMessage, ParticipantChangeDto } from 'shared-lib';
import { ServerMessage } from './server-message';

export class ParticipantChangedMessage
  extends ServerMessage<ParticipantChangeDto>
  implements IParticipantChangedMessage
{
  public constructor(data: ParticipantChangeDto) {
    super(EServerMessageType.MemberChanged, data);
  }
}
