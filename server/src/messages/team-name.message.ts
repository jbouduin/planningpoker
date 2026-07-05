import { EServerMessageType, TeamDto, TeamMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class TeamNameMessage extends ServerMessage<TeamDto> implements TeamMessageDto {
  public constructor(data: TeamDto) {
    super(EServerMessageType.Team, data);
  }
}
