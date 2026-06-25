import { EGameState, EServerMessageType, IGameStateChangedMessage } from 'shared-lib';
import { ServerMessage } from './server-message.js';

export class GameStateChangedMessage extends ServerMessage<EGameState> implements IGameStateChangedMessage {
  public constructor(data: EGameState) {
    super(EServerMessageType.GameStateChanged, data);
  }
}
