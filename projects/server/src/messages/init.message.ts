import { IParticipant, IInitMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class InitMessage extends ServerMessage<IParticipant> implements IInitMessage {
  public constructor(data: IParticipant) {
    super(ServerMessageType.Init, data);
  }
}