import { EErrorCode, ICardSet, IParticipant } from "../../../../shared-lib/lib";
import { ITeam, LooseObject, Participant } from "../../objects";
import { IWebSocket } from "../../services/websocket";

export interface IStorageService {
  canRejoin(uuid: string, teamName: string): EErrorCode;
  createParticipant(socket: IWebSocket): Participant;
  createTeam(teamName: string, cardSet: ICardSet): ITeam;
  deleteParticipant(participantUuid: string): void;
  deleteTeam(teamName: string): void;
  filterParticipants(filter: (participant: Participant) => boolean): Array<Participant>;
  filterTeams(filter: (team: ITeam) => boolean): Array<ITeam>;
  getParticipant(uuid: string): Participant | undefined;
  getTeam(teamName: string): ITeam | undefined;
  getTeamOfParticipant(participantUuid: string): ITeam | undefined;
  joinTeam(team: ITeam, participant: IParticipant): void;
  leaveTeam(team: ITeam, Participant: IParticipant): void;
  participantExists(uuid: string): boolean;
  participantInTeam(uuid: string, teamName: string): boolean;
  serializeAllTeams(): LooseObject;
  serializeTeam(teamname: string): LooseObject;
  serializeParticipants(): LooseObject;
  teamExists(teamName: string): boolean;
}