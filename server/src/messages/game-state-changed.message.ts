import { EServerMessageType, GameStateChangedDto, GameStateChangedMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class GameStateChangedMessage extends ServerMessage<GameStateChangedDto> implements GameStateChangedMessageDto {
  public constructor(data: GameStateChangedDto) {
    super(EServerMessageType.GameStateChanged, data);
  }
}
