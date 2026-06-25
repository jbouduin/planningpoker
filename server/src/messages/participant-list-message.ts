import { EServerMessageType, IParticipantListMessage, ParticipantDto } from 'shared-lib';
import { ServerMessage } from './server-message';

export class ParticipantListMessage extends ServerMessage<Array<ParticipantDto>> implements IParticipantListMessage {
  public constructor(data: Array<ParticipantDto>) {
    super(EServerMessageType.MemberList, data);
  }
}
