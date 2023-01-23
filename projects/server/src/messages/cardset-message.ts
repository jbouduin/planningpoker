import { ICard, ICardSetMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class CardSetMessage extends ServerMessage<Array<ICard>> implements ICardSetMessage {
  public constructor(data: Array<ICard>) {
    super(ServerMessageType.Cards, data);
  }
}