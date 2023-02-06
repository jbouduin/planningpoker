import { ITeam, Participant } from "objects";
import { IWebSocket } from "../../services/websocket";

export interface IStorageService {
  createParticipant(socket: IWebSocket): Participant;
  createTeam(teamName: string, unknownEstimationIndex: number): ITeam;
  deleteParticipant(participantUuid: string): void;
  deleteTeam(teamName: string): void;
  filterParticipants(filter: (participant: Participant) => boolean): Array<Participant>;
  filterTeams(filter: (team: ITeam) => boolean): Array<ITeam>;
  getParticipant(uuid: string): Participant | undefined;
  getTeam(teamName: string): ITeam | undefined;
  getTeamOfParticipant(participantUuid: string): ITeam | undefined;
  joinTeam(participantUuid: string, teamName: string): void;
  participantExists(uuid: string): boolean;
  participantInTeam(uuid: string, teamName: string): boolean;
  teamExists(teamName: string): boolean;
}