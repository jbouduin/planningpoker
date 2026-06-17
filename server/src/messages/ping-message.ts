import { IPingMessage, EServerMessageType } from "shared-lib";
import { ServerMessage } from "./server-message";

export class PingMessage extends ServerMessage<void> implements IPingMessage {
  public constructor() {
    super(EServerMessageType.Ping, undefined);
  }
}
