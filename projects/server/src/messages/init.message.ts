import { DtoParticipant, IInitMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class InitMessage extends ServerMessage<DtoParticipant> implements IInitMessage {
  public constructor(data: DtoParticipant) {
    super(ServerMessageType.Init, data);
  }
}