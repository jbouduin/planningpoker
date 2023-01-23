import { IEndOfGameMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class EndOfGameMessage extends ServerMessage<string> implements IEndOfGameMessage {
  public constructor() {
    super(ServerMessageType.EndOfGame, '');
  }
}