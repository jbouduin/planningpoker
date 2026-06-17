import { EPokerStatus } from "shared-lib";
import { ITeam } from "../../objects";
import { IBaseRepository } from "./base.repository";

export interface ITeamRepository extends IBaseRepository<ITeam> {
  setLastAccessTime(teamName: string): void;
  setStatus(teamName: string, status: EPokerStatus): void;
}
