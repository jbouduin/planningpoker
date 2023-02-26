import { EErrorCode, EPokerStatus, ICardSet, IEstimation } from "../../../../shared-lib/src";
import { ITeam, Participant } from "../../objects";
import { IWebSocket } from "../../services/websocket";

export interface IStorageService {
  //#region participant -------------------------------------------------------
  createParticipant(socket: IWebSocket): Participant;
  deleteParticipant(participantId: string, teamName: string): void;
  filterParticipants(filter: (participant: Participant) => boolean): Array<Participant>;
  getParticipant(participantId: string): Participant | undefined;
  participantExists(participantId: string): boolean;
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
  canRejoin(participantId: string, teamName: string): EErrorCode;
  getFirstConnectedTeamMember(teamName: string): Participant | undefined;
  getConnectedTeamMembers(teamName: string): Array<Participant>;
  getTeamMembers(teamName: string): Array<Participant>;
  getTeamOfParticipant(participantId: string): ITeam | undefined;
  joinTeam(teamName: string, participantId: string): void;
  leaveTeam(teamName: string, participantId: string): void;
  //#endregion

  //#region estimations -------------------------------------------------------
  createEstimation(participantId: string, card: number, revealed: boolean): IEstimation;
  deleteEstimation(teamName: string, participantId: string): IEstimation;
  getEstimations(teamName: string): Array<IEstimation>;
  reveal(teamName: string): [EPokerStatus, Array<IEstimation>];
  startEstimating(teamName: string): EPokerStatus;
  upsertEstimation(teamName: string, participantId: string, cardIndex: number): IEstimation;
  //#endregion

  //#endregion cardset --------------------------------------------------------
  setCardSet(teamName: string, cardSet: ICardSet): void;
  getCardSet(teamName: string): ICardSet;
  //#endregion
}