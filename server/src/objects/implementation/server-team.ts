import { EGameState } from 'shared-lib';
import type { IServerTeam } from '../interfaces/index.js';

export class ServerTeam implements IServerTeam {
  //#region Public properties -------------------------------------------------
  public gameState: EGameState;
  public lastAccessTime: number;
  public readonly teamName: string;
  public readonly teamId: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamId: string, teamName: string) {
    this.lastAccessTime = Date.now();
    this.teamId = teamId;
    this.teamName = teamName;
    this.gameState = EGameState.Cleared;
  }
  //#endregion
}
