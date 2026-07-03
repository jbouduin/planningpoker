import { EClientMessageType, PauseMessageDto } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class PauseMessage extends BaseClientMessage<void> implements PauseMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Pause, undefined);
  }
  //#endregion
}
