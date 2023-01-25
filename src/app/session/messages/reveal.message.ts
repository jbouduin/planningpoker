import { EClientMessageType, IRevealMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class RevealMessage extends ClientMessage<string> implements IRevealMessage {
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.Reveal, data);
  }
}