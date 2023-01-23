import { ICard, ICardSetMessage, EServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class CardSetMessage extends ServerMessage<Array<ICard>> implements ICardSetMessage {
  public constructor(data: Array<ICard>) {
    super(EServerMessageType.CardList, data);
  }
}