import { EClientMessageType, ILeaveMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class LeaveMessage extends ClientMessage<string> implements ILeaveMessage {
  public constructor(sender: string) {
    super(sender, EClientMessageType.Leave, '');
  }
}
