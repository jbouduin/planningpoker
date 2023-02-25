import { inject, injectable } from "inversify";
import { v4 as Uuid } from 'uuid';

import STORAGETYPES from "../storage.types";

import { EErrorCode, ERole, ICardSet } from "../../../../shared-lib/src";
import { Estimation, ITeam, LooseObject, Team } from "../../objects";
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

  public deleteParticipant(participantUuid: string): void {
    const team = this.getTeamOfParticipant(participantUuid);
    if (team) {
      team.teamMembers.delete(participantUuid);
      this.membershipRepository.leaveTeam(team.teamName, participantUuid)
    }
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
    this.teamRepository.remove(teamName);
    this.cardSetRepository.removeCardSet(teamName);
    this.estimationRepository.removeTeam(teamName);
    const result = this.membershipRepository.removeTeam(teamName);
    result.forEach((p: Participant) => this.participantRepository.remove(p.uuid));
    return result;
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
    if (team)
    {
      result = EErrorCode.TeamDoesNotExist;
    } else {
      const member = this.participantRepository.get(uuid);
      if (member) {
        result = member.team === teamName ? EErrorCode.NoError : EErrorCode.ParticipantNotInTeam
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
    const participant = this.participantRepository.get(participantUuid);
    if (participant && participant.team) {
      return this.teamRepository.get(participant.team);
    } else {
      return undefined;
    }
  }

  public getTeamMembers(teamName: string): Array<Participant> {
    return this.membershipRepository.getTeamMembers(teamName);
  }

  // TODO 2364 get rid of this method
  public getTeamNameOfParticipant(participantUuid: string): string | undefined {
    return this.getTeamOfParticipant(participantUuid)?.teamName;
  }

  public joinTeam(teamName: string, participantUuid: string): void {

    this.membershipRepository.joinTeam(teamName, participantUuid);
  }

  public leaveTeam(teamName: string, participantUuid: string): void {
    this.membershipRepository.leaveTeam(teamName, participantUuid);
  }
  //#endregion

  //#region estimations -------------------------------------------------------
  public deleteEstimation(teamName: string, participantUuid: string): Estimation {
    return this.estimationRepository.deleteEstimation(teamName, participantUuid);
  }

  public getEstimations(teamName: string): Array<Estimation> {
    return this.estimationRepository.getEstimations(teamName);
  }

  public reveal(teamName: string): Array<Estimation> {
    const cardSet = this.cardSetRepository.getCardSet(teamName);
    if (cardSet){
      return this.estimationRepository.reveal(teamName, cardSet.unknownEstimationIndex);
    } else {
      return new Array<Estimation>();
    }
  }

  public startEstimating(teamName: string): void {
    return this.estimationRepository.startEstimating(teamName);
  }

  public upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): Estimation {
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

  // TODO NOW create separate service for this
  //#region Serialization -----------------------------------------------------
  public serializeAllTeams(): LooseObject {
    const result: LooseObject = {
      teams: new Array<LooseObject>()
    };

    this.teamRepository.getAll().forEach((team: ITeam) => {
      const gameDump: LooseObject = {
        team: team.teamName,
        status: team.status,
        members: new Array<LooseObject>()
      }
      Array.from(team.teamMembers.values()).forEach((menber: Participant) => gameDump.members.push({
        name: menber.nick,
        role: menber.role,
        status: menber.status,
        observer: menber.observer,
        uuid: menber.uuid
      }));
      result.teams.push(gameDump);
    });
    return result;
  }

  public serializeTeam(teamName: string): LooseObject {
    const team = this.teamRepository.get(teamName);
    if (team) {
      const result: LooseObject = {
        team: team.teamName,
        status: team.status,
        members: new Array<LooseObject>()
      }
      Array.from(team.teamMembers.values()).forEach((member: Participant) => result.members.push({
        name: member.nick,
        role: member.role,
        status: member.status,
        observer: member.observer,
        uuid: member.uuid
      }));
      return result;
    }
    else {
      return {
        error: EErrorCode.TeamDoesNotExist,
        errorMessage: `Team '${teamName}' not found`
      }
    }
  }

  public serializeParticipants(): LooseObject {
    const result = new Array<LooseObject>();
    this.participantRepository.getAll().forEach((participant: Participant) => {
      result.push({
        name: participant.nick,
        role: participant.role,
        status: participant.status,
        observer: participant.observer,
        uuid: participant.uuid
      })
    });
    return result;
  }
  //#endregion
}