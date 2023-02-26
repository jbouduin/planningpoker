import { inject, injectable } from "inversify";

import STORAGETYPES from "../../storage/storage.types";

import { EErrorCode } from "../../../../shared-lib/src";
import { ITeam, LooseObject, Participant } from "../../objects";
import { IMembershipRepository, IParticipantRepository, ITeamRepository } from "../../storage/interfaces";
import { ISerializationService } from "../interfaces";

@injectable()
export class SerializationService implements ISerializationService {
  //#region Private properties ------------------------------------------------
  private readonly membershipRepository: IMembershipRepository;
  private readonly participantRepository: IParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.MembershipRepository) membershipRepository: IMembershipRepository,
    @inject(STORAGETYPES.ParticipantRepository) participantRepository: IParticipantRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository) {
    this.membershipRepository = membershipRepository;
    this.participantRepository = participantRepository;
    this.teamRepository = teamRepository;
  }
  //#endregion

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
      this.membershipRepository.getTeamMembers(team.teamName).forEach((menber: Participant) => gameDump.members.push({
        name: menber.nick,
        role: menber.role,
        status: menber.status,
        observer: menber.observer,
        participantId: menber.participantId
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
      this.membershipRepository.getTeamMembers(team.teamName).forEach((member: Participant) => result.members.push({
        name: member.nick,
        role: member.role,
        status: member.status,
        observer: member.observer,
        participantId: member.participantId
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
        participantId: participant.participantId
      })
    });
    return result;
  }
  //#endregion

}