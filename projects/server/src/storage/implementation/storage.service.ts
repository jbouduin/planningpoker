import { inject, injectable } from "inversify";

import STORAGETYPES from "../storage.types";

import { EErrorCode, EPokerStatus, ICardSet, IEstimation } from "../../../../shared-lib/src";
import { IServerParticipant, ITeam, Team } from "../../objects";
import { IWebSocket } from "../../services/websocket";
import { ICardSetRepository, IEstimationRepository, IMembershipRepository, IServerParticipantRepository, IStorageService, ITeamRepository } from "../../storage/interfaces";

@injectable()
export class StorageService implements IStorageService {

  //#region Private properties ------------------------------------------------
  private readonly cardSetRepository: ICardSetRepository;
  private readonly estimationRepository: IEstimationRepository;
  private readonly membershipRepository: IMembershipRepository;
  private readonly participantRepository: IServerParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  private cnt: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.CardSetRepository) cardSetRepository: ICardSetRepository,
    @inject(STORAGETYPES.EstimationRepository) estimationRepository: IEstimationRepository,
    @inject(STORAGETYPES.MembershipRepository) membershipRepository: IMembershipRepository,
    @inject(STORAGETYPES.ServerParticipantRepository) participantRepository: IServerParticipantRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository) {
    this.cardSetRepository = cardSetRepository;
    this.estimationRepository = estimationRepository;
    this.membershipRepository = membershipRepository;
    this.participantRepository = participantRepository;
    this.teamRepository = teamRepository;
    this.cnt = 0;
  }
  //#endregion

  //#region participant -------------------------------------------------------
  public createParticipant(socket: IWebSocket): IServerParticipant {
    const result = this.participantRepository.createParticipant(socket);
    this.participantRepository.add(result);
    return result;
  }

  public deleteParticipant(participantId: string, teamName: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.membershipRepository.leaveTeam(teamName, participantId);
    this.estimationRepository.removeParticipant(teamName, participantId);
    this.participantRepository.remove(participantId);
  }

  public filterParticipants(filter: (participant: IServerParticipant) => boolean): Array<IServerParticipant> {
    return this.participantRepository.getAll().filter(filter);
  }

  public getParticipant(participantId: string): IServerParticipant | undefined {
    return this.participantRepository.get(participantId);
  }

  public participantExists(participantId: string): boolean {
    return this.participantRepository.exists(participantId);
  }
  //#endregion

  //#region Team --------------------------------------------------------------
  public allTeams(): Array<ITeam> {
    return this.teamRepository.getAll();
  }

  public createTeam(teamName: string, cardSet: ICardSet): ITeam {
    const result = new Team(teamName);
    this.cardSetRepository.setCardSet(teamName, cardSet);
    this.teamRepository.add(result);
    return result;
  }

  public deleteTeam(teamName: string): Array<IServerParticipant> {
    this.cardSetRepository.removeCardSet(teamName);
    this.estimationRepository.removeTeam(teamName);
    const members = this.membershipRepository.getTeamMembers(teamName);
    this.membershipRepository.removeTeam(teamName);
    members.forEach((p: IServerParticipant) => this.participantRepository.remove(p.participantId));
    this.teamRepository.remove(teamName);
    return members;
  }

  public filterTeams(filter: (team: ITeam) => boolean): Array<ITeam> {
    return this.teamRepository.getAll().filter(filter);
  }

  public getTeam(teamName: string): ITeam | undefined {
    return this.teamRepository.get(teamName);
  }

  public teamExists(teamName: string): boolean {
    return this.teamRepository.exists(teamName);
  }
  //#endregion

  //#region membership methods ------------------------------------------------
  public canRejoin(participantId: string, teamName: string): EErrorCode {
    let result: EErrorCode;
    const team = this.teamRepository.get(teamName);
    if (team) {
      result = EErrorCode.TeamDoesNotExist;
    } else {
      const member = this.participantRepository.get(participantId);
      if (member) {
        result = this.membershipRepository.participantIsMemberOf(participantId, teamName) ? EErrorCode.NoError : EErrorCode.ParticipantNotInTeam
      } else {
        result = EErrorCode.ParticipantNotFound;
      }
    }
    return result;
  }

  public getConnectedTeamMembers(teamName: string): Array<IServerParticipant> {
    return this.membershipRepository.getConnectedTeamMembers(teamName);
  }

  public getFirstConnectedTeamMember(teamName: string): IServerParticipant | undefined {
    const connectedTeamMembers = this.membershipRepository.getConnectedTeamMembers(teamName);
    return connectedTeamMembers.length > 0 ? connectedTeamMembers[0] : undefined;
  }

  public getTeamOfParticipant(participantId: string): ITeam | undefined {
    return this.membershipRepository.getTeamOfParticipant(participantId);
  }

  public getTeamMembers(teamName: string): Array<IServerParticipant> {
    return this.membershipRepository.getTeamMembers(teamName);
  }

  public joinTeam(teamName: string, participantId: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.membershipRepository.joinTeam(teamName, participantId);
  }

  public leaveTeam(teamName: string, participantId: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.membershipRepository.leaveTeam(teamName, participantId);
  }
  //#endregion

  //#region estimations -------------------------------------------------------
  public createEstimation(participantId: string, card: number, revealed: boolean): IEstimation {
    return this.estimationRepository.createEstimation(participantId, card, revealed);
  }

  public deleteEstimation(teamName: string, participantId: string): IEstimation {
    this.teamRepository.setLastAccessTime(teamName);
    return this.estimationRepository.deleteEstimation(teamName, participantId);
  }

  public getEstimations(teamName: string): Array<IEstimation> {
    return this.estimationRepository.getEstimations(teamName);
  }

  public reveal(teamName: string): [EPokerStatus, Array<IEstimation>] {
    const cardSet = this.cardSetRepository.getCardSet(teamName);
    const result = this.estimationRepository.getEstimations(teamName);
    if (cardSet) {
      this.membershipRepository.getConnectedTeamMembers(teamName).forEach((p: IServerParticipant) => {
        if (result.filter((e: IEstimation) => e.participantId !== p.participantId).length === 0) {
          const estimation = this.estimationRepository.upsertEstimation(teamName, p.participantId, cardSet.unknownEstimationIndex)
          result.push(estimation);
        }
      });
    }
    this.teamRepository.setStatus(teamName, EPokerStatus.Revealed);
    return [EPokerStatus.Revealed, result];
  }

  public startEstimating(teamName: string): EPokerStatus {
    this.teamRepository.setStatus(teamName, EPokerStatus.Started);
    this.estimationRepository.startEstimating(teamName);
    return EPokerStatus.Started;
  }

  public upsertEstimation(teamName: string, participantId: string, cardIndex: number): IEstimation {
    this.teamRepository.setLastAccessTime(teamName);
    return this.estimationRepository.upsertEstimation(teamName, participantId, cardIndex);
  }
  //#endregion

  //#region Cardset -----------------------------------------------------------
  public setCardSet(teamName: string, cardSet: ICardSet): void {
    this.cardSetRepository.setCardSet(teamName, cardSet);
  }

  public getCardSet(teamName: string): ICardSet {
    const result = this.cardSetRepository.getCardSet(teamName);
    if (result) {
      return result;
    } else {
      throw new Error('Team has no cardset');
    }
  }
  //#endregion

}