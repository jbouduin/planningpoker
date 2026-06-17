import { EPokerStatus } from "shared-lib";

export interface ITeam {
  status: EPokerStatus;
  teamName: string;
  lastAccessTime: number;
}
