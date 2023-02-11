import { IServerResetMessage, EServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class ServerResetMessage extends ServerMessage<void> implements IServerResetMessage {
  public constructor() {
    super(EServerMessageType.Reset, undefined);
  }
}