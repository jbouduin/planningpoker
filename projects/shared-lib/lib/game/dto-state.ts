import { DtoCard} from './dto-card';
import { DtoEstimation } from './dto-estimation';
import { DtoGame } from './dto-game';
import { DtoParticipant } from './dto-participant';

export interface DtoState {
  cards: Array<DtoCard>;
  estimations: Array<DtoEstimation>;
  game: DtoGame;
  others: Array<DtoParticipant>;
  self: DtoParticipant;
}
