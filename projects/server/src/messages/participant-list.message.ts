import { IParticipant, IParticipantListMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class ParticipantListMessage extends ServerMessage<Array<IParticipant>> implements IParticipantListMessage {
  public constructor(data: Array<IParticipant>) {
    super(ServerMessageType.Participant, data);
  }
}