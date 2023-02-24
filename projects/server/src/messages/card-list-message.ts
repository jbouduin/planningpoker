import { EServerMessageType, ICardSet, ICardSetMessage } from "../../../shared-lib/src";
import { ServerMessage } from "./server-message";

export class CardSetMessage extends ServerMessage<ICardSet> implements ICardSetMessage {
  public constructor(data: ICardSet) {
    super(EServerMessageType.CardList, data);
  }
}