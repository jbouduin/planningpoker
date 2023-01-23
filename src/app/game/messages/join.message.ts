import { IJoin, ClientMessageType, IJoinMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class JoinMessage extends ClientMessage<IJoin> implements IJoinMessage {
  public constructor(sender: string, data: IJoin) {
    super(sender, ClientMessageType.Join, data);
  }
}