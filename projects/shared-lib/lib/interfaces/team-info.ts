import { ICard} from './card';
import { IEstimation } from './estimation';
import { IParticipant } from './participant';
import { EGameStatus } from './game-status.enum';

export interface ITeamInfo {
  teamName: string;
  gameStatus: EGameStatus;
  self: IParticipant;
  cards: Array<ICard>;
  estimations: Array<IEstimation>;
  otherMembers: Array<IParticipant>;
}
