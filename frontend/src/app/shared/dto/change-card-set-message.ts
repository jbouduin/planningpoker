import { EClientMessageType, ICardSet, IChangeCardSetMessage } from 'shared-lib';

import { BaseClientMessage } from './base-client-message';

export class ChangeCardSetMessage extends BaseClientMessage<ICardSet> implements IChangeCardSetMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: ICardSet) {
    super(sender, EClientMessageType.ChangeCardSet, data);
  }
  //#endregion
}
