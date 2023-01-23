import { ICard} from './card';
import { IEstimation } from './estimation';
import { ITeamInfo } from './team-info';
import { IParticipant } from './participant';

export interface ITeamStatus {
  cards: Array<ICard>;
  estimations: Array<IEstimation>;
  game: ITeamInfo;
  others: Array<IParticipant>;
  self: IParticipant;
}
