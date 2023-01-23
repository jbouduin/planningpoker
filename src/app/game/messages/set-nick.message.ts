import { ClientMessageType, ISetNickMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class SetNickMessage extends ClientMessage<string> implements ISetNickMessage {
  public constructor(sender: string, data: string) {
    super(sender, ClientMessageType.Nick, data);
  }
}
