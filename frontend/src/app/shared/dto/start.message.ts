import { EClientMessageType, StartMessageDto } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class StartMessage extends BaseClientMessage<void> implements StartMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Start, undefined);
  }
  //#endregion
}
