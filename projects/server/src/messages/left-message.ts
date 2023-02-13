import { EServerMessageType, ILeftMessage } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class LeftMessage extends ServerMessage<void> implements ILeftMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    super(EServerMessageType.Left, undefined);
  }
  //#endregion
}