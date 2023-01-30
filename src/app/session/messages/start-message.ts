import { EClientMessageType, IStartMessage } from "@shared-lib";
import { BaseClientMessage } from "./base-client.message";

export class StartMessage extends BaseClientMessage<string> implements IStartMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.Start, data);
  }
  //#endregion
}