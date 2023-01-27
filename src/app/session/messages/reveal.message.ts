import { EClientMessageType, IRevealMessage } from "@shared-lib";
import { BaseClientMessage } from "./base-client.message";

export class RevealMessage extends BaseClientMessage<string> implements IRevealMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.Reveal, data);
  }
  //#endregion
}