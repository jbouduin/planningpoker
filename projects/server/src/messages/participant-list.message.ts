import { DtoParticipant, IParticipantListMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class ParticipantListMessage extends ServerMessage<Array<DtoParticipant>> implements IParticipantListMessage {
  public constructor(data: Array<DtoParticipant>) {
    super(ServerMessageType.Participant, data);
  }
}