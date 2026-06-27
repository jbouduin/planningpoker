import { EClientMessageType, IEstimateMessage } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class EstimateMessage extends BaseClientMessage<number | null> implements IEstimateMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: number | null) {
    super(sender, EClientMessageType.Estimate, data);
  }
  //#endregion
}
