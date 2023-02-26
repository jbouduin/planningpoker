import { EPokerStatus } from '../../../shared-lib/src';

export interface ITeam {
  status: EPokerStatus;
  teamName: string;
  lastAccessTime: number;
}

export class Team implements ITeam {
  //#region Public properties -------------------------------------------------
  public status: EPokerStatus;
  public lastAccessTime: number;
  public readonly teamName: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamName: string) {
    this.lastAccessTime = Date.now();
    this.teamName = teamName;
    this.status = EPokerStatus.Cleared;
  }
  //#endregion
}
