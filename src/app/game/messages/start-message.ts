import { EClientMessageType, IStartMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class StartMessage extends ClientMessage<string> implements IStartMessage {
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.Start, data);
  }
}