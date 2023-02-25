import { inject, injectable } from "inversify";

import STORAGETYPES from "../storage.types";

import { EParticipantStatus } from "../../../../shared-lib/src";
import { Participant } from "../../objects";
import { IMembershipRepository, IParticipantRepository, ITeamRepository } from "../interfaces";

@injectable()
export class MembershipRepository implements IMembershipRepository {

  //#region Private properties ------------------------------------------------
  private readonly participantRepository: IParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.ParticipantRepository) participantRepository: IParticipantRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository) {
    this.participantRepository = participantRepository;
    this.teamRepository = teamRepository;
  }
  //#endregion

  //#region IMembershipRepository methods -------------------------------------
  public removeTeam(teamName: string): Array<Participant> {
    const team = this.teamRepository.get(teamName);
    const result = new Array<Participant>();
    if (team) {
      team.lastAccessTime = Date.now();
      for (const member of team.teamMembers.values()) {
        result.push(member);
        member.team = undefined;
      }
      team.teamMembers.clear();
    }
    return result;
  }

  public getConnectedTeamMembers(teamName: string): Array<Participant> {
    const team = this.teamRepository.get(teamName);
    if (team) {
      return Array.from(team.teamMembers.values())
        .filter((p: Participant) => p.status === EParticipantStatus.Connected);
    } else {
      return new Array<Participant>();
    }
  }

  public joinTeam(teamName: string, participant: string): void {
    const team = this.teamRepository.get(teamName);
    const member = this.participantRepository.get(participant);
    if (team && member){
      team.lastAccessTime = Date.now();
      team.teamMembers.set(participant, member);
      member.team = team.teamName;
    }
  }

  public leaveTeam(teamName: string, participant: string): void {
    const team = this.teamRepository.get(teamName);
    const member = this.participantRepository.get(participant);
    if (team && member) {
      team.lastAccessTime = Date.now();
      team.teamMembers.delete(participant);
      member.team = undefined;
    }
  }

  public getTeamMembers(teamName: string): Array<Participant> {
    const team = this.teamRepository.get(teamName);
    if (team) {
      return Array.from(team.teamMembers.values());
    } else {
      return new Array<Participant>();
    }
  }
  //#endregion
}