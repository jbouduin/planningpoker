import { inject, injectable } from "inversify";

import STORAGETYPES from "../storage.types";

import { EParticipantStatus } from "../../../../shared-lib/src";
import { ITeam, IServerParticipant } from "../../objects";
import { IMembershipRepository, IServerParticipantRepository, ITeamRepository } from "../interfaces";

@injectable()
export class MembershipRepository implements IMembershipRepository {

  //#region Private properties ------------------------------------------------
  private readonly participantRepository: IServerParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  private readonly memberships: Map<string, Array<string>>;
  private readonly participantTeamMap: Map<string, string>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.ServerParticipantRepository) participantRepository: IServerParticipantRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository) {
    this.participantRepository = participantRepository;
    this.teamRepository = teamRepository;
    this.memberships = new Map<string, Array<string>>();
    this.participantTeamMap = new Map<string, string>();
  }
  //#endregion

  //#region IMembershipRepository methods -------------------------------------
  public getTeamOfParticipant(participantId: string): ITeam | undefined {
    const mapEntry = this.participantTeamMap.get(participantId);
    if (mapEntry) {
      return this.teamRepository.get(mapEntry);
    } else {
      return undefined;
    }
  }

  public participantIsMemberOf(participantId:string, teamName: string): boolean {
    return this.participantTeamMap.get(participantId) === teamName;
  }

  public removeTeam(teamName: string): void {
    this.memberships.delete(teamName);
  }

  public getConnectedTeamMembers(teamName: string): Array<IServerParticipant> {
    return this.getTeamMembers(teamName)
      .filter((p: IServerParticipant) => p.status === EParticipantStatus.Connected);
  }

  public joinTeam(teamName: string, participant: string): void {
    const teamMembers = this.getTeamMemberships(teamName);
    if (teamMembers.indexOf(participant) < 0) {
      teamMembers.push(participant);
    }
    this.participantTeamMap.set(participant, teamName);
  }

  public leaveTeam(teamName: string, participant: string): void {
    const teamMembers = this.getTeamMemberships(teamName);
    const index = teamMembers.indexOf(participant);
    if (index >= 0) {
      teamMembers.splice(index, 1);
    }
    this.participantTeamMap.delete(participant);
  }

  public getTeamMembers(teamName: string): Array<IServerParticipant> {
    const result = new Array<IServerParticipant>()
    this.getTeamMemberships(teamName).forEach((participantId: string) => {
      const participant = this.participantRepository.get(participantId);
      if (participant) {
        result.push(participant);
      }
    });
    return result;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private getTeamMemberships(teamName: string): Array<string    > {
    const result = this.memberships.get(teamName) || new Array<string>();
    if (!this.memberships.has(teamName)) {
      this.memberships.set(teamName, result);
    }
    return result;
  }
  //#endregion
}