import { EClientMessageType, ToggleObserverDto, ToggleObserverMessageDto } from 'shared-lib';
import { BaseClientMessage } from '../../../core';

export class ToggleObserverMessage extends BaseClientMessage<ToggleObserverDto> implements ToggleObserverMessageDto {
  //#region Constructor & C° --------------------------------------------------
  public constructor(sender: string, observe: ToggleObserverDto) {
    super(sender, EClientMessageType.Observe, observe);
  }
  //#endregion
}
