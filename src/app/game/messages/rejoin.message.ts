import { ClientMessageType, IRejoinMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class RejoinMessage extends ClientMessage<string> implements IRejoinMessage {
  public constructor(sender: string, data: string) {
    super(sender, ClientMessageType.Rejoin, data);
  }
}