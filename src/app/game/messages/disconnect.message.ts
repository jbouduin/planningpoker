import { ClientMessageType, IDisconnectMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class DisconnectMessage extends ClientMessage<string> implements IDisconnectMessage {
  public constructor(sender: string) {
    super(sender, ClientMessageType.KillMe, '');
  }
}