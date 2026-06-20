import { EServerMessageType, ITeamNameMessage } from 'shared-lib';
import { ServerMessage } from './server-message';

export class TeamNameMessage extends ServerMessage<string> implements ITeamNameMessage {
  public constructor(data: string) {
    super(EServerMessageType.TeamName, data);
  }
}
