import { EPokerStatus, IPokerStatusChangedMessage, EServerMessageType } from 'shared-lib';
import { ServerMessage } from './server-message';

export class PokerStatusChangedMessage extends ServerMessage<EPokerStatus> implements IPokerStatusChangedMessage {
  public constructor(data: EPokerStatus) {
    super(EServerMessageType.PokerStatus, data);
  }
}
