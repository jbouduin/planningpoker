import { GameStatus } from './game-status';
import { DtoCard } from './dto-card';

export interface DtoGame {
  team: string;
  status: GameStatus;
}
