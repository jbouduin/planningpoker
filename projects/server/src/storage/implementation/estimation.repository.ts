import { inject, injectable } from "inversify";

import STORAGETYPES from "../storage.types";

import { EPokerStatus } from "../../../../shared-lib/src";
import { Estimation, Participant } from "../../objects";
import { IEstimationRepository, IMembershipRepository, ITeamRepository } from "../../storage/interfaces";

@injectable()
export class EstimationRepository implements IEstimationRepository {

  //#region private properties ------------------------------------------------
  private readonly teamRepository: ITeamRepository;
  private readonly membershipRepository: IMembershipRepository;
  private readonly estimations: Map<string, Map<string, Estimation>>;
  //#endregion

  //#region Construcotr & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.MembershipRepository) membershipRepository: IMembershipRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository) {
    this.membershipRepository = membershipRepository;
    this.teamRepository = teamRepository;
    this.estimations = new Map<string, Map<string, Estimation>>();
  }
  //#endregion

  //#region IEstimationRepository methods -------------------------------------
  public deleteEstimation(teamName: string, participantUuid: string): Estimation {
    const team = this.teamRepository.get(teamName);
    if (team) {
      team.lastAccessTime = Date.now();
      const teamEstimations = this.estimations.get(teamName);
      if (teamEstimations) {
        teamEstimations.delete(participantUuid);
      }
    }
    return new Estimation(participantUuid, -1);
  }

  public removeTeam(teamName: string): void {
    this.estimations.delete(teamName);
  }

  public getEstimations(teamName: string): Array<Estimation> {
    const teamEstimations = this.estimations.get(teamName);
    return teamEstimations ? Array.from(teamEstimations.values()) : new Array<Estimation>();
  }

  public reveal(teamName: string, unknownEstimationIndex: number): Array<Estimation> {
    const teamEstimations = this.estimations.get(teamName) || new Map<string, Estimation>();
    const team = this.teamRepository.get(teamName);
    if (team) {
      team.lastAccessTime = Date.now();
      team.status = EPokerStatus.Revealed;
      // TODO NOW this logic should go into storage
      this.membershipRepository.getConnectedTeamMembers(teamName).forEach((p: Participant) => {
        if (!teamEstimations.has(p.uuid)) {
          teamEstimations.set(p.uuid, new Estimation(p.uuid, unknownEstimationIndex));
        }
      });
    }
    return Array.from(teamEstimations.values());
  }

  public startEstimating(teamName: string): void {
    const team = this.teamRepository.get(teamName);
    if (team) {
      team.lastAccessTime = Date.now();
      team.status = EPokerStatus.Started;
      this.estimations.set(teamName, new Map<string, Estimation>());
    }
  }

  public upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): Estimation {
    const result = new Estimation(participantUuid, cardIndex);
    const team = this.teamRepository.get(teamName);
    if (team) {
      team.lastAccessTime = Date.now();
      const teamEstimations = this.estimations.get(teamName);
      if (teamEstimations) {
        teamEstimations.set(participantUuid, result);
      }
    }
    return result;
  }
  //#endregion
}