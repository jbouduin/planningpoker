import { IParticipant, IInitMessage, EServerMessageType } from "../../../shared-lib/src";
import { ServerMessage } from "./server-message";

export class InitMessage extends ServerMessage<IParticipant> implements IInitMessage {
  public constructor(data: IParticipant) {
    super(EServerMessageType.Init, data);
  }
}