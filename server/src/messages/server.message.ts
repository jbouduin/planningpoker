import { EServerMessageType, ServerMessageDto } from 'shared-lib';

export abstract class ServerMessage<T extends object | void> implements ServerMessageDto<T> {
  public readonly data: T;
  public readonly type: EServerMessageType;

  public constructor(type: EServerMessageType, data: T) {
    this.type = type;
    this.data = data;
  }
}
