import { EClientMessageType, IObserveMessage, ObserverChangeDto } from 'shared-lib';
import { BaseClientMessage } from './base-client-message';

export class SwitchObserverMessage extends BaseClientMessage<ObserverChangeDto> implements IObserveMessage {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, observe: ObserverChangeDto) {
    super(sender, EClientMessageType.Observe, observe);
  }
  //#endregion
}
