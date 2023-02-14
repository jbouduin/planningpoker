import { ECardSet, EClientMessageType } from "@shared-lib";
import { BaseClientMessage } from "./base-client.message";

export class ChangeCardSetMessage extends BaseClientMessage<ECardSet> implements ChangeCardSetMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: ECardSet) {
    super(sender, EClientMessageType.ChangeCardSet, data);
  }
  //#endregion
}