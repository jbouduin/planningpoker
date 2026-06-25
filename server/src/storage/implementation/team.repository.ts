import { injectable } from 'inversify';
import { EGameState } from 'shared-lib';
import { IServerTeam } from '../../objects';
import { ITeamRepository } from '../../storage/interfaces';

@injectable()
export class TeamRepository implements ITeamRepository {
  //#region private properties ------------------------------------------------
  private readonly teams: Map<string, IServerTeam>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.teams = new Map<string, IServerTeam>();
  }
  //#endregion

  //#region IBaseRepository methods -------------------------------------------
  public add(entity: IServerTeam): void {
    this.teams.set(entity.teamName, entity);
  }

  public remove(id: string): void {
    this.teams.delete(id);
  }

  public get(id: string): IServerTeam | undefined {
    return this.teams.get(id);
  }

  public getAll(): Array<IServerTeam> {
    return Array.from(this.teams.values());
  }

  public exists(id: string): boolean {
    return this.teams.has(id);
  }
  //#endregion

  //#region ITeamRepository methods -------------------------------------------
  public setLastAccessTime(teamName: string): void {
    const team = this.teams.get(teamName);
    if (team) {
      team.lastAccessTime = Date.now();
    }
  }

  public setGameState(teamName: string, gameState: EGameState): void {
    const team = this.teams.get(teamName);
    if (team) {
      team.lastAccessTime = Date.now();
      team.gameState = gameState;
    }
  }
  //#endregion
}
