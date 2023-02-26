import { inject, injectable } from "inversify";
import { v4 as Uuid } from 'uuid';

import STORAGETYPES from "../storage.types";

import { EErrorCode, EPokerStatus, ERole, ICardSet, IEstimation } from "../../../../shared-lib/src";
import { ITeam, Team } from "../../objects";
import { Participant } from "../../objects/participant";
import { IWebSocket } from "../../services/websocket";
import { ICardSetRepository, IEstimationRepository, IMembershipRepository, IParticipantRepository, IStorageService, ITeamRepository } from "../../storage/interfaces";

@injectable()
export class StorageService implements IStorageService {

  //#region Private properties ------------------------------------------------
  private readonly cardSetRepository: ICardSetRepository;
  private readonly estimationRepository: IEstimationRepository;
  private readonly membershipRepository: IMembershipRepository;
  private readonly participantRepository: IParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  private cnt: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.CardSetRepository) cardSetRepository: ICardSetRepository,
    @inject(STORAGETYPES.EstimationRepository) estimationRepository: IEstimationRepository,
    @inject(STORAGETYPES.MembershipRepository) membershipRepository: IMembershipRepository,
    @inject(STORAGETYPES.ParticipantRepository) participantRepository: IParticipantRepository,
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
  public createParticipant(socket: IWebSocket): Participant {
    const result = new Participant(`participant ${++this.cnt}`, Uuid(), ERole.Unknown, socket);
    this.participantRepository.add(result);
    return result;
  }

  public deleteParticipant(participantUuid: string, teamName: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.membershipRepository.leaveTeam(teamName, participantUuid);
    this.estimationRepository.removeParticipant(teamName, participantUuid);
    this.participantRepository.remove(participantUuid);
  }

  public filterParticipants(filter: (participant: Participant) => boolean): Array<Participant> {
    return this.participantRepository.getAll().filter(filter);
  }

  public getParticipant(uuid: string): Participant | undefined {
    return this.participantRepository.get(uuid);
  }

  public participantExists(uuid: string): boolean {
    return this.participantRepository.exists(uuid);
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

  public deleteTeam(teamName: string): Array<Participant> {
    this.cardSetRepository.removeCardSet(teamName);
    this.estimationRepository.removeTeam(teamName);
    const members = this.membershipRepository.getTeamMembers(teamName);
    this.membershipRepository.removeTeam(teamName);
    members.forEach((p: Participant) => this.participantRepository.remove(p.uuid));
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
  public canRejoin(uuid: string, teamName: string): EErrorCode {
    let result: EErrorCode;
    const team = this.teamRepository.get(teamName);
    if (team) {
      result = EErrorCode.TeamDoesNotExist;
    } else {
      const member = this.participantRepository.get(uuid);
      if (member) {
        result = this.membershipRepository.isMemberOf(uuid, teamName) ? EErrorCode.NoError : EErrorCode.ParticipantNotInTeam
      } else {
        result = EErrorCode.ParticipantNotFound;
      }
    }
    return result;
  }

  public getConnectedTeamMembers(teamName: string): Array<Participant> {
    return this.membershipRepository.getConnectedTeamMembers(teamName);
  }

  public getFirstConnectedTeamMember(teamName: string): Participant | undefined {
    const connectedTeamMembers = this.membershipRepository.getConnectedTeamMembers(teamName);
    return connectedTeamMembers.length > 0 ? connectedTeamMembers[0] : undefined;
  }

  public getTeamOfParticipant(participantUuid: string): ITeam | undefined {
    return this.membershipRepository.getTeamOfParticipant(participantUuid);
  }

  public getTeamMembers(teamName: string): Array<Participant> {
    return this.membershipRepository.getTeamMembers(teamName);
  }

  public joinTeam(teamName: string, participantUuid: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.membershipRepository.joinTeam(teamName, participantUuid);
  }

  public leaveTeam(teamName: string, participantUuid: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.membershipRepository.leaveTeam(teamName, participantUuid);
  }
  //#endregion

  //#region estimations -------------------------------------------------------
  public createEstimation(uuid: string, card: number, revealed: boolean): IEstimation {
    return this.estimationRepository.createEstimation(uuid, card, revealed);
  }

  public deleteEstimation(teamName: string, participantUuid: string): IEstimation {
    this.teamRepository.setLastAccessTime(teamName);
    return this.estimationRepository.deleteEstimation(teamName, participantUuid);
  }

  public getEstimations(teamName: string): Array<IEstimation> {
    return this.estimationRepository.getEstimations(teamName);
  }

  public reveal(teamName: string): [EPokerStatus, Array<IEstimation>] {
    const cardSet = this.cardSetRepository.getCardSet(teamName);
    const result = this.estimationRepository.getEstimations(teamName);
    if (cardSet) {
      this.membershipRepository.getConnectedTeamMembers(teamName).forEach((p: Participant) => {
        if (result.filter((e: IEstimation) => e.participantUuid !== p.uuid).length === 0) {
          const estimation = this.estimationRepository.upsertEstimation(teamName, p.uuid, cardSet.unknownEstimationIndex)
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

  public upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): IEstimation {
    this.teamRepository.setLastAccessTime(teamName);
    return this.estimationRepository.upsertEstimation(teamName, participantUuid, cardIndex);
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