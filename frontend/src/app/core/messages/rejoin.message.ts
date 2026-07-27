import { EClientMessageType, RejoinMessageDto } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class RejoinMessage extends BaseClientMessage<string> implements RejoinMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.Rejoin, data);
  }
  //#endregion
}
