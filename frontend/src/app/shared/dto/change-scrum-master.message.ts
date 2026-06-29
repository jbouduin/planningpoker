import { ChangeScrumMasterMessageDto, EClientMessageType } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class ChangeScrumMasterMessage extends BaseClientMessage<string> implements ChangeScrumMasterMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: string) {
    super(sender, EClientMessageType.ChangeScrumMaster, data);
  }
  //#endregion
}
