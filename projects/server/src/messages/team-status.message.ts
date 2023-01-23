import { ServerMessageType, ITeamStatusMessage, ITeamStatus } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class TeamStatusMessage extends ServerMessage<ITeamStatus> implements ITeamStatusMessage {
  public constructor(data: ITeamStatus) {
    super(ServerMessageType.State, data);
  }
}