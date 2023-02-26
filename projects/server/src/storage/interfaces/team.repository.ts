import { ITeam } from "../../objects";
import { IBaseRepository } from "./base.repository";

export interface ITeamRepository extends IBaseRepository<ITeam> {
  setLastAccessTime(teamName: string): void;
}