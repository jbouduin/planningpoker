import { EClientMessageType, IDisconnectMessage } from "@shared-lib";
import { BaseClientMessage } from "./base-client.message";

export class DisconnectMessage extends BaseClientMessage<void> implements IDisconnectMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Disconnect, undefined);
  }
  //#endregion
}