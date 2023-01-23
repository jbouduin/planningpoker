import { IServerResetMessage, EServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class ServerResetMessage extends ServerMessage<string> implements IServerResetMessage {
  public constructor() {
    super(EServerMessageType.Reset, '');
  }
}