import { EClientMessageType, IStartMessage } from "@shared-lib";

import { BaseClientMessage } from "./base-client-message";

export class StartMessage extends BaseClientMessage<void> implements IStartMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Start, undefined);
  }
  //#endregion
}