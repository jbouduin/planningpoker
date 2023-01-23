import { EClientMessageType, ICreate, ICreatemessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class CreateMessage extends ClientMessage<ICreate> implements ICreatemessage {
  public constructor(sender: string, data: ICreate) {
    super(sender, EClientMessageType.Create, data);
  }
}