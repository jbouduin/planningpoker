import { ClientMessageType, IClientMessage } from "@shared-lib";

export abstract class ClientMessage<T> implements IClientMessage<T> {
  public readonly senderUuid: string;
  public readonly data: T;
  public readonly type: ClientMessageType;

  public constructor(sender: string, type: ClientMessageType, data: T) {
    this.senderUuid = sender;
    this.data = data;
    this.type = type;
  }
}