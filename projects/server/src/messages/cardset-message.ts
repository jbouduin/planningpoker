import { DtoCard, ICardSetMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class CardSetMessage extends ServerMessage<Array<DtoCard>> implements ICardSetMessage {
  public constructor(data: Array<DtoCard>) {
    super(ServerMessageType.Cards, data);
  }
}