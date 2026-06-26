import { EClientMessageType, IChangeNickMessage } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class ChangeNickMessage extends BaseClientMessage<string> implements IChangeNickMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.ChangeNick, data);
  }
  //#endregion
}
