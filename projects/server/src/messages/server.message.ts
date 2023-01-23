import { IServerMessage, ServerMessageType } from "../../../shared-lib/lib";

export abstract class ServerMessage<T> implements IServerMessage<T> {
  public readonly data: T;
  public readonly type: ServerMessageType;

  public constructor(type: ServerMessageType, data: T) {
    this.type = type;
    this.data = data;
  }
}