import { EGameState } from 'shared-lib';
import type { IServerTeam } from '../../objects/interfaces/index.js';
import { IBaseRepository } from './base.repository.js';

export interface ITeamRepository extends IBaseRepository<IServerTeam> {
  setLastAccessTime(teamName: string): void;
  setGameState(teamName: string, gameState: EGameState): void;
}
