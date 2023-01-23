import { EServerMessageType, ITeamInfoMessage, ITeamInfo } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class TeamInfoMessage extends ServerMessage<ITeamInfo> implements ITeamInfoMessage {
  public constructor(data: ITeamInfo) {
    super(EServerMessageType.TeamInfo, data);
  }
}