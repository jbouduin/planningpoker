import { ClientMessageType, DtoCreate, ICreatemessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class CreateMessage extends ClientMessage<DtoCreate> implements ICreatemessage {
  public constructor(sender: string, data: DtoCreate) {
    super(sender, ClientMessageType.Create, data);
  }
}