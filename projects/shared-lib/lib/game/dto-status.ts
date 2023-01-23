import { DtoCard} from './dto-card';
import { DtoEstimation } from './dto-estimation';
import { DtoTeam } from './dto-team';
import { DtoParticipant } from './dto-participant';

export interface DtoStatus {
  cards: Array<DtoCard>;
  estimations: Array<DtoEstimation>;
  game: DtoTeam;
  others: Array<DtoParticipant>;
  self: DtoParticipant;
}
