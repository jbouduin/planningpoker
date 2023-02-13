import { EServerMessageType, ITeamIdleMessage } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class TeamIdleMessage extends ServerMessage<void> implements ITeamIdleMessage {
  public constructor() {
    super(EServerMessageType.TeamIdle, undefined);
  }
}