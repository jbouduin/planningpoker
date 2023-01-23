import { IParticipant, ISelfMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class SelfMessage extends ServerMessage<IParticipant> implements ISelfMessage {
  public constructor(data: IParticipant) {
    super(ServerMessageType.Self, data);
  }
}