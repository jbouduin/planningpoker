import { EGameState } from 'shared-lib';
import { IServerTeam } from '../interfaces/server-team';

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
