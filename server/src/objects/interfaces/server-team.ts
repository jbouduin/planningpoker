import { EGameState } from 'shared-lib';

export interface IServerTeam {
  gameState: EGameState;
  teamName: string;
  lastAccessTime: number;
}
