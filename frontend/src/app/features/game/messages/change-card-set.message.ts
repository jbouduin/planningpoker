import { CardSetDto, ChangeCardSetMessageDto, EClientMessageType } from 'shared-lib';
import { BaseClientMessage } from '../../../core';

export class ChangeCardSetMessage extends BaseClientMessage<CardSetDto> implements ChangeCardSetMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: CardSetDto) {
    super(sender, EClientMessageType.ChangeCardSet, data);
  }
  //#endregion
}
