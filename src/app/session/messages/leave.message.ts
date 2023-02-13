import { EClientMessageType, ILeaveMessage } from "@shared-lib";
import { BaseClientMessage } from "./base-client.message";

export class LeaveMessage extends BaseClientMessage<void> implements ILeaveMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Leave, undefined);
  }
  //#endregion
}
