import { EClientMessageType, IObserveMessage, IObserverChange } from "shared-lib";

import { BaseClientMessage } from "./base-client-message";

export class ObserveMessage extends BaseClientMessage<IObserverChange> implements IObserveMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, observe: IObserverChange) {
    super(sender, EClientMessageType.Observe, observe);
  }
  //#endregion
}
