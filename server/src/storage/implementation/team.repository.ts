import { injectable } from 'inversify';

import { EPokerStatus } from 'shared-lib';
import { ITeam } from '../../objects';
import { ITeamRepository } from '../../storage/interfaces';

@injectable()
export class TeamRepository implements ITeamRepository {
  //#region private properties ------------------------------------------------
  private readonly teams: Map<string, ITeam>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.teams = new Map<string, ITeam>();
  }
  //#endregion

  //#region IBaseRepository methods -------------------------------------------
  public add(entity: ITeam): void {
    this.teams.set(entity.teamName, entity);
  }

  public remove(id: string): void {
    this.teams.delete(id);
  }

  public get(id: string): ITeam | undefined {
    return this.teams.get(id);
  }

  public getAll(): Array<ITeam> {
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

  public setStatus(teamName: string, status: EPokerStatus): void {
    const team = this.teams.get(teamName);
    if (team) {
      team.lastAccessTime = Date.now();
      team.status = status;
    }
  }
  //#endregion
}
