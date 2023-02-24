import { EServerMessageType, IMemberStatusChange, IMemberChangedMessage } from "../../../shared-lib/src";
import { ServerMessage } from "./server-message";

export class MemberChangedMessage extends ServerMessage<IMemberStatusChange> implements IMemberChangedMessage {
  public constructor(data: IMemberStatusChange) {
    super(EServerMessageType.MemberChanged, data);
  }
}