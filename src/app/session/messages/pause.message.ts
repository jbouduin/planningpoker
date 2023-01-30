import { EClientMessageType, IPauseMessage } from "@shared-lib";
import { BaseClientMessage } from "./base-client.message";

export class PauseMessage extends BaseClientMessage<string> implements IPauseMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Pause, '');
  }
  //#endregion
}