import { IServerResetMessage, EServerMessageType } from "../../../shared-lib/src";
import { ServerMessage } from "./server-message";

export class ServerResetMessage extends ServerMessage<void> implements IServerResetMessage {
  public constructor() {
    super(EServerMessageType.ServerReset, undefined);
  }
}