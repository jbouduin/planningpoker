import { EClientMessageType, IClientMessage } from "@shared-lib";

export abstract class BaseClientMessage<T> implements IClientMessage<T> {
  //#region public read-only properties ---------------------------------------
  public readonly senderUuid: string;
  public readonly data: T;
  public readonly type: EClientMessageType;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, type: EClientMessageType, data: T) {
    this.senderUuid = sender;
    this.data = data;
    this.type = type;
  }
  //#endregion
}