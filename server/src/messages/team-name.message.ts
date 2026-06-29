import { EServerMessageType, TeamNameMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class TeamNameMessage extends ServerMessage<string> implements TeamNameMessageDto {
  public constructor(data: string) {
    super(EServerMessageType.TeamName, data);
  }
}
