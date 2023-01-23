import { IDissolveTeamMessage, EServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class DissolveTeamMessage extends ServerMessage<string> implements IDissolveTeamMessage {
  public constructor() {
    super(EServerMessageType.DissolveTeam, '');
  }
}