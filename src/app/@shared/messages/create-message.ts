import { EClientMessageType, ICreate, ICreatemessage } from "@shared-lib";

import { BaseClientMessage } from "./base-client-message";

export class CreateMessage extends BaseClientMessage<ICreate> implements ICreatemessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: ICreate) {
    super(sender, EClientMessageType.Create, data);
  }
  //#endregion
}