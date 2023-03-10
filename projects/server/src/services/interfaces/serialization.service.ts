import { LooseObject } from "../../objects";

export interface ISerializationService {
  serializeAllTeams(): LooseObject;
  serializeTeam(teamname: string): LooseObject;
  serializeParticipants(): LooseObject;
}