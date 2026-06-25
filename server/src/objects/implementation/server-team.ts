import { EGameState } from 'shared-lib';
import type { IServerTeam } from '../interfaces/index.js';

export class ServerTeam implements IServerTeam {
  //#region Public properties -------------------------------------------------
  public gameState: EGameState;
  public lastAccessTime: number;
  public readonly teamName: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamName: string) {
    this.lastAccessTime = Date.now();
    this.teamName = teamName;
    this.gameState = EGameState.Cleared;
  }
  //#endregion
}
