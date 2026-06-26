import { EClientMessageType, IRejoinMessage } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class RejoinMessage extends BaseClientMessage<string> implements IRejoinMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.Rejoin, data);
  }
  //#endregion
}
