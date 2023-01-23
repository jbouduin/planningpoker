import { ITeamInfo, ITeamMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class TeamMessage extends ServerMessage<ITeamInfo> implements ITeamMessage {
  public constructor(data: ITeamInfo) {
    super(ServerMessageType.Team, data);
  }
}