import { IEndSessionMessage, EServerMessageType } from "shared-lib";
import { ServerMessage } from "./server-message";

export class EndSessionMessage extends ServerMessage<void> implements IEndSessionMessage {
  public constructor() {
    super(EServerMessageType.EndSession, undefined);
  }
}
