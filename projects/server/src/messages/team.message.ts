import { DtoTeam, ITeamMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class TeamMessage extends ServerMessage<DtoTeam> implements ITeamMessage {
  public constructor(data: DtoTeam) {
    super(ServerMessageType.Team, data);
  }
}