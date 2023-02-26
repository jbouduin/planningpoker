import { EPokerStatus } from "../../../../shared-lib/src";
import { ITeam } from "../../objects";
import { IBaseRepository } from "./base.repository";

export interface ITeamRepository extends IBaseRepository<ITeam> {
  createTeam(teamName: string): ITeam;
  setLastAccessTime(teamName: string): void;
  setStatus(teamName: string, status: EPokerStatus): void;
}