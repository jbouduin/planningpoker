import { IJoin, EClientMessageType, IJoinMessage } from "shared-lib";

import { BaseClientMessage } from "./base-client-message";

export class JoinMessage extends BaseClientMessage<IJoin> implements IJoinMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: IJoin) {
    super(sender, EClientMessageType.Join, data);
  }
  //#endregion
}
