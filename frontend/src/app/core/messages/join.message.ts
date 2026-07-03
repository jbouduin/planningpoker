import { EClientMessageType, JoinDto, JoinMessageDto } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class JoinMessage extends BaseClientMessage<JoinDto> implements JoinMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: JoinDto) {
    super(sender, EClientMessageType.Join, data);
  }
  //#endregion
}
