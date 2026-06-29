import { EServerMessageType, ParticipantDto, StartHandshakeMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class StartHandshakeMessage extends ServerMessage<ParticipantDto> implements StartHandshakeMessageDto {
  public constructor(data: ParticipantDto) {
    super(EServerMessageType.StartHandshake, data);
  }
}
