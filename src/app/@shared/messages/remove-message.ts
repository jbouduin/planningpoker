import { EClientMessageType, IRemoveMessage } from "@shared-lib";

import { BaseClientMessage } from "./base-client-message";

export class RemoveMessage extends BaseClientMessage<string> implements IRemoveMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, uuid: string) {
    super(sender, EClientMessageType.Remove, uuid);
  }
  //#endregion
}