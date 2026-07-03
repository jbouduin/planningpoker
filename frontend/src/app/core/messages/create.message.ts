import { CreateDto, CreateMessageDto, EClientMessageType } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class CreateMessage extends BaseClientMessage<CreateDto> implements CreateMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, data: CreateDto) {
    super(sender, EClientMessageType.Create, data);
  }
  //#endregion
}
