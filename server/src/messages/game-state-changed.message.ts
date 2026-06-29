import { EGameState, EServerMessageType, GameStateChangedMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class GameStateChangedMessage extends ServerMessage<EGameState> implements GameStateChangedMessageDto {
  public constructor(data: EGameState) {
    super(EServerMessageType.GameStateChanged, data);
  }
}
