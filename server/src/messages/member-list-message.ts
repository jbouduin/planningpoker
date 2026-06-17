import { EServerMessageType, IMemberListMessage, IParticipant } from "shared-lib";
import { ServerMessage } from "./server-message";

export class MemberListMessage extends ServerMessage<Array<IParticipant>> implements IMemberListMessage {
  public constructor(data: Array<IParticipant>) {
    super(EServerMessageType.MemberList, data);
  }
}
