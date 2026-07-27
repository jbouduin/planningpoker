import { EClientMessageType, StartMessageDto } from 'shared-lib';
import { BaseClientMessage } from '../../../core';

export class StartMessage extends BaseClientMessage<void> implements StartMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Start, undefined);
  }
  //#endregion
}
