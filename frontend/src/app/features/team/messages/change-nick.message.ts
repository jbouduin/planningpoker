import { ChangeNickMessageDto, EClientMessageType } from 'shared-lib';
import { BaseClientMessage } from '../../../core';

export class ChangeNickMessage extends BaseClientMessage<string> implements ChangeNickMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.ChangeNick, data);
  }
  //#endregion
}
