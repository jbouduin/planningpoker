import { EErrorCode, EPokerStatus, ICardSet } from "../../../../shared-lib/src";
import { Estimation, ITeam, Participant } from "../../objects";
import { IWebSocket } from "../../services/websocket";

export interface IStorageService {
  //#region participant -------------------------------------------------------
  createParticipant(socket: IWebSocket): Participant;
  deleteParticipant(participantUuid: string): void;
  filterParticipants(filter: (participant: Participant) => boolean): Array<Participant>;
  getParticipant(uuid: string): Participant | undefined;
  participantExists(uuid: string): boolean;
  //#endregion

  //#region team --------------------------------------------------------------
  allTeams(): Array<ITeam>;
  createTeam(teamName: string, cardSet: ICardSet): ITeam;
  deleteTeam(teamName: string): Array<Participant>;
  filterTeams(filter: (team: ITeam) => boolean): Array<ITeam>;
  getTeam(teamName: string): ITeam | undefined;
  teamExists(teamName: string): boolean;
  //#endregion

  //#region membership --------------------------------------------------------
  canRejoin(uuid: string, teamName: string): EErrorCode;
  getFirstConnectedTeamMember(teamName: string): Participant | undefined;
  getConnectedTeamMembers(teamName: string): Array<Participant>;
  getTeamMembers(teamName: string): Array<Participant>;
  getTeamOfParticipant(participantUuid: string): ITeam | undefined;
  joinTeam(teamName: string, participantUuid: string): void;
  leaveTeam(teamName: string, participantUuid: string): void;
  //#endregion

  //#region estimations -------------------------------------------------------
  deleteEstimation(teamName: string, participantUuid: string): Estimation;
  getEstimations(teamName: string): Array<Estimation>;
  reveal(teamName: string): [EPokerStatus, Array<Estimation>];
  startEstimating(teamName: string): EPokerStatus;
  upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): Estimation;
  //#endregion

  //#endregion cardset --------------------------------------------------------
  setCardSet(teamName: string, cardSet: ICardSet): void;
  getCardSet(teamName: string): ICardSet;
  //#endregion
}