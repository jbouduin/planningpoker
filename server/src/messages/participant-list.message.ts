import { EServerMessageType, ParticipantDto, ParticipantListMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class ParticipantListMessage extends ServerMessage<Array<ParticipantDto>> implements ParticipantListMessageDto {
  public constructor(data: Array<ParticipantDto>) {
    super(EServerMessageType.ParticipantList, data);
  }
}
