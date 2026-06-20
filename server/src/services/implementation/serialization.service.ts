import { inject, injectable } from 'inversify';

import STORAGETYPES from '../../storage/storage.types';

import { EErrorCode } from 'shared-lib';
import { IServerParticipant, ITeam, LooseObject } from '../../objects';
import { IMembershipRepository, IServerParticipantRepository, ITeamRepository } from '../../storage/interfaces';
import { ISerializationService } from '../interfaces';

@injectable()
export class SerializationService implements ISerializationService {
  //#region Private properties ------------------------------------------------
  private readonly membershipRepository: IMembershipRepository;
  private readonly participantRepository: IServerParticipantRepository;
  private readonly teamRepository: ITeamRepository;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.MembershipRepository) membershipRepository: IMembershipRepository,
    @inject(STORAGETYPES.ServerParticipantRepository) participantRepository: IServerParticipantRepository,
    @inject(STORAGETYPES.TeamRepository) teamRepository: ITeamRepository
  ) {
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
      const teamDump: LooseObject = {
        team: team.teamName,
        status: team.status,
        members: this.membershipRepository.getTeamMembers(team.teamName).map((p: IServerParticipant) => p.self)
      };
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      result.teams.push(teamDump);
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      /* eslint-enable @typescript-eslint/no-unsafe-call */
    });
    return result;
  }

  public serializeTeam(teamName: string): LooseObject {
    const team = this.teamRepository.get(teamName);
    if (team) {
      const result: LooseObject = {
        team: team.teamName,
        status: team.status,
        members: this.membershipRepository.getTeamMembers(team.teamName).map((p: IServerParticipant) => p.self)
      };
      return result;
    } else {
      return {
        error: EErrorCode.TeamNotFound,
        errorMessage: `Team '${teamName}' not found`
      };
    }
  }

  public serializeParticipants(): LooseObject {
    const result = new Array<IServerParticipant>();
    this.participantRepository.getAll().map((p: IServerParticipant) => p.self);
    return result;
  }
  //#endregion
}
