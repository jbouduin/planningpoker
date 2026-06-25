import { CardSetDto, EServerMessageType, ICardSetMessage } from 'shared-lib';
import { ServerMessage } from './server-message';

export class CardSetMessage extends ServerMessage<CardSetDto> implements ICardSetMessage {
  public constructor(data: CardSetDto) {
    super(EServerMessageType.CardSet, data);
  }
}
