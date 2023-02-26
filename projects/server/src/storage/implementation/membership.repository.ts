import { inject, injectable } from "inversify";

import STORAGETYPES from "../storage.types";

import { EParticipantStatus } from "../../../../shared-lib/src";
import { ITeam, Participant } from "../../objects";
import { IMembershipRepository, IParticipantRepository, ITeamRepository } from "../interfaces";

@injectable()
export class MembershipRepository implements IMembershipRepository {

  //#region Private properties ------------------------------------------------
  private readonly participantRepository: IParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  private readonly memberships: Map<string, Array<string>>;
  private readonly participantTeamMap: Map<string, string>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.ParticipantRepository) participantRepository: IParticipantRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository) {
    this.participantRepository = participantRepository;
    this.teamRepository = teamRepository;
    this.memberships = new Map<string, Array<string>>();
    this.participantTeamMap = new Map<string, string>();
  }
  //#endregion

  //#region IMembershipRepository methods -------------------------------------
  public getTeamOfParticipant(uuid: string): ITeam | undefined {
    const mapEntry = this.participantTeamMap.get(uuid);
    if (mapEntry) {
      return this.teamRepository.get(mapEntry);
    } else {
      return undefined;
    }
  }

  public isMemberOf(teamName: string, uuid: string): boolean {
    return this.participantTeamMap.get(uuid) === teamName;
  }

  public removeTeam(teamName: string): void {
    this.memberships.delete(teamName);
  }

  public getConnectedTeamMembers(teamName: string): Array<Participant> {
    return this.getTeamMembers(teamName)
      .filter((p: Participant) => p.status === EParticipantStatus.Connected);
  }

  public joinTeam(teamName: string, participant: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    const teamMembers = this.getTeamMemberships(teamName);
    if (teamMembers.indexOf(participant) < 0) {
      teamMembers.push(participant);
    }
    this.participantTeamMap.set(participant, teamName);
  }

  public leaveTeam(teamName: string, participant: string): void {
    this.teamRepository.setLastAccessTime(teamName);
    const teamMembers = this.getTeamMemberships(teamName);
    const index = teamMembers.indexOf(participant);
    if (index >= 0) {
      teamMembers.splice(index, 1);
    }
    this.participantTeamMap.delete(participant);
  }

  public getTeamMembers(teamName: string): Array<Participant> {
    const result = new Array<Participant>()
    this.getTeamMemberships(teamName).forEach((uuid: string) => {
      const participant = this.participantRepository.get(uuid);
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