import { EPokerStatus } from "../../../../shared-lib/src";

export interface ITeam {
  status: EPokerStatus;
  teamName: string;
  lastAccessTime: number;
}