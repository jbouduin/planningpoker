import { DisbandMessageDto, EClientMessageType } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class DisbandMessage extends BaseClientMessage<string> implements DisbandMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, teamName: string) {
    super(sender, EClientMessageType.Disband, teamName);
  }
  //#endregion
}
