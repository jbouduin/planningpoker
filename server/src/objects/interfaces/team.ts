import { EPokerStatus } from 'shared-lib';

export interface ITeam {
  // TODO Rename field to pokerState
  status: EPokerStatus;
  teamName: string;
  lastAccessTime: number;
}
