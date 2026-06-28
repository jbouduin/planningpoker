import { inject, injectable } from 'inversify';
import { CardSetDto, EErrorCode, EGameState } from 'shared-lib';
import type { IServerEstimation, IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';
import type {
  ICardSetRepository,
  IEstimationRepository,
  IMembershipRepository,
  IServerParticipantRepository,
  IStorageService,
  ITeamRepository
} from '../../storage/interfaces/index.js';
import STORAGETYPES from '../storage.types.js';

@injectable()
export class StorageService implements IStorageService {
  //#region Private properties ------------------------------------------------
  private readonly cardSetRepository: ICardSetRepository;
  private readonly estimationRepository: IEstimationRepository;
  // private readonly factoryService: IFactoryService;
  private readonly membershipRepository: IMembershipRepository;
  private readonly participantRepository: IServerParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.CardSetRepository) cardSetRepository: ICardSetRepository,
    @inject(STORAGETYPES.EstimationRepository) estimationRepository: IEstimationRepository,
    // @inject(STORAGETYPES.FactoryService) factoryService: IFactoryService,
    @inject(STORAGETYPES.MembershipRepository) membershipRepository: IMembershipRepository,
    @inject(STORAGETYPES.ServerParticipantRepository) participantRepository: IServerParticipantRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository
  ) {
    this.cardSetRepository = cardSetRepository;
    this.estimationRepository = estimationRepository;
    // this.factoryService = factoryService;
    this.membershipRepository = membershipRepository;
    this.participantRepository = participantRepository;
    this.teamRepository = teamRepository;
  }
  //#endregion

  //#region participant -------------------------------------------------------
  public addParticipant(participant: IServerParticipant): void {
    this.participantRepository.add(participant);
  }

  public deleteParticipant(participantId: string, teamName: string | undefined): void {
    if (teamName) {
      this.teamRepository.setLastAccessTime(teamName);
      this.membershipRepository.leaveTeam(teamName, participantId);
      this.estimationRepository.removeParticipant(teamName, participantId);
    }
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
  public addTeam(team: IServerTeam, cardSet: CardSetDto): void {
    this.cardSetRepository.setCardSet(team.teamName, cardSet);
    this.teamRepository.add(team);
  }

  public allTeams(): Array<IServerTeam> {
    return this.teamRepository.getAll();
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

  public filterTeams(filter: (team: IServerTeam) => boolean): Array<IServerTeam> {
    return this.teamRepository.getAll().filter(filter);
  }

  public getTeam(teamName: string): IServerTeam | undefined {
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
    if (!team) {
      result = EErrorCode.TeamNotFound;
    } else {
      const member = this.participantRepository.get(participantId);
      if (member) {
        result = this.membershipRepository.participantIsMemberOf(participantId, teamName)
          ? EErrorCode.NoError
          : EErrorCode.ParticipantNotInTeam;
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

  public getTeamOfParticipant(participantId: string): IServerTeam | undefined {
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
  public deleteEstimation(teamName: string, participantId: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.estimationRepository.deleteEstimation(teamName, participantId);
  }

  public getEstimations(teamName: string): Array<IServerEstimation> {
    return this.estimationRepository.getEstimations(teamName);
  }

  public reveal(teamName: string): void {
    this.teamRepository.setGameState(teamName, EGameState.Revealed);
  }

  public startEstimating(teamName: string): EGameState {
    this.teamRepository.setGameState(teamName, EGameState.Started);
    this.estimationRepository.startEstimating(teamName);
    return EGameState.Started;
  }

  public upsertEstimation(teamName: string, participantId: string, cardIndex: number): IServerEstimation {
    this.teamRepository.setLastAccessTime(teamName);
    return this.estimationRepository.upsertEstimation(teamName, participantId, cardIndex);
  }
  //#endregion

  //#region Cardset -----------------------------------------------------------
  public setCardSet(teamName: string, cardSet: CardSetDto): void {
    this.teamRepository.setLastAccessTime(teamName);
    this.cardSetRepository.setCardSet(teamName, cardSet);
  }

  public getCardSet(teamName: string): CardSetDto {
    const result = this.cardSetRepository.getCardSet(teamName);
    if (result) {
      return result;
    } else {
      throw new Error('Team has no cardset');
    }
  }
  //#endregion
}
