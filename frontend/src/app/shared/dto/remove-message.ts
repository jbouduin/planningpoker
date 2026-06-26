import { EClientMessageType, IRemoveMessage } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class RemoveMessage extends BaseClientMessage<string> implements IRemoveMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, participantId: string) {
    super(sender, EClientMessageType.Remove, participantId);
  }
  //#endregion
}
