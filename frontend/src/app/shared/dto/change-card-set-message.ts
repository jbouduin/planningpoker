import { CardSetDto, EClientMessageType, IChangeCardSetMessage } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class ChangeCardSetMessage extends BaseClientMessage<CardSetDto> implements IChangeCardSetMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: CardSetDto) {
    super(sender, EClientMessageType.ChangeCardSet, data);
  }
  //#endregion
}
