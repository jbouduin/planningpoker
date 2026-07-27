import { CardSetDto, EErrorCode, EGameState } from 'shared-lib';
import type { IServerEstimation, IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';

export interface IStorageService {
  //#region participant -------------------------------------------------------
  /**
   * Store a participant in the Participant repository
   * @param participant - the IServerParticipant
   */
  addParticipant(participant: IServerParticipant): void;

  /**
   * Deletes the participant from the participant repository
   *
   * If a team name is provided:
   * - the last access time of the team is updated
   * - the participant is removed from the membership repository
   * - the participant is removed from the estimation repository
   * @param participantId - the participant id
   * @param teamName - the team name
   */
  deleteParticipant(participantId: string, teamName: string | undefined): void;

  /**
   * Filter all known participants
   * @param filter - predicate to filter
   * @returns an array of IServerParticipant
   */
  filterParticipants(filter: (participant: IServerParticipant) => boolean): Array<IServerParticipant>;

  /**
   * Get a participant by its participantId
   *
   * @param participantId - the participants Id
   * @returns the participant or undefined if not found
   */
  getParticipant(participantId: string): IServerParticipant | undefined;

  /**
   * Check if a participant is known to the system
   * @param participantId - the participants Id
   */
  participantExists(participantId: string): boolean;
  //#endregion

  //#region team --------------------------------------------------------------
  addTeam(team: IServerTeam, cardSet: CardSetDto): void;
  allTeams(): Array<IServerTeam>;
  deleteTeam(teamName: string): Array<IServerParticipant>;
  filterTeams(filter: (team: IServerTeam) => boolean): Array<IServerTeam>;
  getTeam(teamName: string): IServerTeam | undefined;
  teamExists(teamName: string): boolean;
  //#endregion

  //#region membership --------------------------------------------------------
  canRejoin(participantId: string, teamName: string): EErrorCode;
  getFirstConnectedTeamMember(teamName: string): IServerParticipant | undefined;
  getConnectedTeamMembers(teamName: string): Array<IServerParticipant>;
  getTeamMembers(teamName: string): Array<IServerParticipant>;
  getTeamOfParticipant(participantId: string): IServerTeam | undefined;
  joinTeam(teamName: string, participantId: string): void;
  leaveTeam(teamName: string, participantId: string): void;
  //#endregion

  //#region estimations -------------------------------------------------------
  clear(teamName: string): void;
  deleteEstimation(teamName: string, participantId: string): void;
  getEstimations(teamName: string): Array<IServerEstimation>;
  reveal(teamName: string): void;
  startEstimating(teamName: string): EGameState;
  upsertEstimation(teamName: string, participantId: string, cardIndex: number): IServerEstimation;
  //#endregion

  //#endregion cardset --------------------------------------------------------
  setCardSet(teamName: string, cardSet: CardSetDto): void;
  getCardSet(teamName: string): CardSetDto;
  //#endregion
}
