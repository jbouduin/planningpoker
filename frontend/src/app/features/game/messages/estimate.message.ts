import { EClientMessageType, EstimateMessageDto } from 'shared-lib';
import { BaseClientMessage } from '../../../core';

export class EstimateMessage extends BaseClientMessage<number> implements EstimateMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: number) {
    super(sender, EClientMessageType.Estimate, data);
  }
  //#endregion
}
