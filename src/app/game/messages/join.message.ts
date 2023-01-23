import { DtoJoin, ClientMessageType, IJoinMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class JoinMessage extends ClientMessage<DtoJoin> implements IJoinMessage {
  public constructor(sender: string, data: DtoJoin) {
    super(sender, ClientMessageType.Join, data);
  }
}