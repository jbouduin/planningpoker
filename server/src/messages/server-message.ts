import { IServerMessage, EServerMessageType } from "shared-lib";

export abstract class ServerMessage<T> implements IServerMessage<T> {
  public readonly data: T;
  public readonly type: EServerMessageType;

  public constructor(type: EServerMessageType, data: T) {
    this.type = type;
    this.data = data;
  }
}
