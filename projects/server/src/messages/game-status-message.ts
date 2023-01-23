import { EGameStatus, IGameStatusMessage, EServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class GameStatusMessage extends ServerMessage<EGameStatus> implements IGameStatusMessage {
  public constructor(data: EGameStatus) {
    super(EServerMessageType.GameStatus, data);
  }
}