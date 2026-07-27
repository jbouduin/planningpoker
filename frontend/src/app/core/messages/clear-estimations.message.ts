import { ClearEstimationsMessageDto, EClientMessageType } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class ClearEstimationMessage extends BaseClientMessage<void> implements ClearEstimationsMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.ClearEstimations, undefined);
  }
  //#endregion
}
