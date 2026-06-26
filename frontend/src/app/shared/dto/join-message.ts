import { JoinDto, EClientMessageType, IJoinMessage } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class JoinMessage extends BaseClientMessage<JoinDto> implements IJoinMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: JoinDto) {
    super(sender, EClientMessageType.Join, data);
  }
  //#endregion
}
