import { ServerMessageType, ITeamStatusMessage, DtoStatus } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class TeamStatusMessage extends ServerMessage<DtoStatus> implements ITeamStatusMessage {
  public constructor(data: DtoStatus) {
    super(ServerMessageType.State, data);
  }
}