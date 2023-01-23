import { IPingMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class PingMessage extends ServerMessage<string> implements IPingMessage {
  public constructor() {
    super(ServerMessageType.Ping, '');
  }
}