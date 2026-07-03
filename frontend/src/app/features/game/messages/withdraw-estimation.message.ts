import { EClientMessageType, WithDrawMessageDto } from 'shared-lib';
import { BaseClientMessage } from '../../../core';

export class WithdrawEstimationMessage extends BaseClientMessage<void> implements WithDrawMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.WithdrawEstimation, undefined);
  }
  //#endregion
}
