import { CardSetDto, CardSetMessageDto, EServerMessageType } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class CardSetMessage extends ServerMessage<CardSetDto> implements CardSetMessageDto {
  public constructor(data: CardSetDto) {
    super(EServerMessageType.CardSet, data);
  }
}
