import { EGameState } from 'shared-lib';
import { IServerTeam } from '../../objects';
import { IBaseRepository } from './base.repository';

export interface ITeamRepository extends IBaseRepository<IServerTeam> {
  setLastAccessTime(teamName: string): void;
  setGameState(teamName: string, gameState: EGameState): void;
}
