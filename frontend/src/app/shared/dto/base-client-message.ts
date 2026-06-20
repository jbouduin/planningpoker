import { EClientMessageType, IClientMessage } from 'shared-lib';

// TODO check if we should put messages in the features directory
export abstract class BaseClientMessage<T> implements IClientMessage<T> {
  //#region public read-only properties ---------------------------------------
  public readonly senderId: string;
  public readonly data: T;
  public readonly type: EClientMessageType;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, type: EClientMessageType, data: T) {
    this.senderId = sender;
    this.data = data;
    this.type = type;
  }
  //#endregion
}
