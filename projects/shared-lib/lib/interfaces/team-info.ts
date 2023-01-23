import { ICard} from './card';
import { IEstimation } from './estimation';
import { IParticipant } from './participant';
import { EGameStatus } from './game-status.enum';

// TODO self is only relevant in client, so should not be in here
export interface ITeamInfo {
  teamName: string;
  gameStatus: EGameStatus;
  self: IParticipant;
  cards: Array<ICard>;
  estimations: Array<IEstimation>;
  otherMembers: Array<IParticipant>;
}
