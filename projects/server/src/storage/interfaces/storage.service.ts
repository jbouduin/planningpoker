import { EErrorCode, EPokerStatus, ICardSet, IEstimation } from "../../../../shared-lib/src";
import { ITeam, Participant } from "../../objects";
import { IWebSocket } from "../../services/websocket";

export interface IStorageService {
  //#region participant -------------------------------------------------------
  createParticipant(socket: IWebSocket): Participant;
  deleteParticipant(participantUuid: string, teamName: string): void;
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
  createEstimation(uuid: string, card: number, revealed: boolean): IEstimation;
  deleteEstimation(teamName: string, participantUuid: string): IEstimation;
  getEstimations(teamName: string): Array<IEstimation>;
  reveal(teamName: string): [EPokerStatus, Array<IEstimation>];
  startEstimating(teamName: string): EPokerStatus;
  upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): IEstimation;
  //#endregion

  //#endregion cardset --------------------------------------------------------
  setCardSet(teamName: string, cardSet: ICardSet): void;
  getCardSet(teamName: string): ICardSet;
  //#endregion
}