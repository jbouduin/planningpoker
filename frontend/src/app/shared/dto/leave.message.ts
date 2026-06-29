import { EClientMessageType, LeaveMessageDto } from 'shared-lib';
import { BaseClientMessage } from './base-client.message';

export class LeaveMessage extends BaseClientMessage<string> implements LeaveMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, leavingParticipant: string) {
    super(sender, EClientMessageType.Leave, leavingParticipant);
  }
  //#endregion
}
