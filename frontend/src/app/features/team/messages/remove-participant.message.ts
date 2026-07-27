import { EClientMessageType, RemoveParticipantMessageDto } from 'shared-lib';
import { BaseClientMessage } from '../../../core';

export class RemoveParticipantMessage extends BaseClientMessage<string> implements RemoveParticipantMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, participantId: string) {
    super(sender, EClientMessageType.Remove, participantId);
  }
  //#endregion
}
