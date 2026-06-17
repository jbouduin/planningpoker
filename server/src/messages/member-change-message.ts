import { EServerMessageType, IMemberChange, IMemberChangeMessage } from "shared-lib";
import { ServerMessage } from "./server-message";

export class MemberChangeMessage extends ServerMessage<IMemberChange> implements IMemberChangeMessage {
  public constructor(data: IMemberChange) {
    super(EServerMessageType.MemberChanged, data);
  }
}
