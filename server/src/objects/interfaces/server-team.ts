import { EGameState } from 'shared-lib';

export interface IServerTeam {
  gameState: EGameState;
  teamName: string;
  teamId: string;
  lastAccessTime: number;
}
