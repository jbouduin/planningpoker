import { DtoParticipant, ISelfMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class SelfMessage extends ServerMessage<DtoParticipant> implements ISelfMessage {
  public constructor(data: DtoParticipant) {
    super(ServerMessageType.Self, data);
  }
}