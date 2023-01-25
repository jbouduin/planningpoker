import { IEndSessionMessage, EServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class EndSessionMessage extends ServerMessage<string> implements IEndSessionMessage {
  public constructor() {
    super(EServerMessageType.EndSession, '');
  }
}