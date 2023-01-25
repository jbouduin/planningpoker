import { EClientMessageType, IClientMessage } from "@shared-lib";

export abstract class ClientMessage<T> implements IClientMessage<T> {
  public readonly senderUuid: string;
  public readonly data: T;
  public readonly type: EClientMessageType;

  public constructor(sender: string, type: EClientMessageType, data: T) {
    this.senderUuid = sender;
    this.data = data;
    this.type = type;
  }
}