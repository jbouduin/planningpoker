import { EClientMessageType, IDisconnectMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class DisconnectMessage extends ClientMessage<string> implements IDisconnectMessage {
  public constructor(sender: string) {
    super(sender, EClientMessageType.Disconnect, '');
  }
}