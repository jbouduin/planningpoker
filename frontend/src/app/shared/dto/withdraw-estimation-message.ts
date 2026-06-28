import { EClientMessageType, IWithDrawMessage } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class WithdrawEstimationMessage extends BaseClientMessage<void> implements IWithDrawMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.WithdrawEstimation, undefined);
  }
  //#endregion
}
