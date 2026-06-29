import { EClientMessageType, RevealMessageDto } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class RevealMessage extends BaseClientMessage<void> implements RevealMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string) {
    super(sender, EClientMessageType.Reveal, undefined);
  }
  //#endregion
}
