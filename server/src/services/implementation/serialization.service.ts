import { inject, injectable } from 'inversify';
import { EErrorCode, LooseObjectDto } from 'shared-lib';
import { IServerParticipant, IServerTeam } from '../../objects';
import { IMembershipRepository, IServerParticipantRepository, ITeamRepository } from '../../storage/interfaces';
import STORAGETYPES from '../../storage/storage.types';
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
  public serializeAllTeams(): LooseObjectDto {
    const result: LooseObjectDto = {
      teams: new Array<LooseObjectDto>()
    };

    this.teamRepository.getAll().forEach((team: IServerTeam) => {
      const teamDump: LooseObjectDto = {
        team: team.teamName,
        gameState: team.gameState,
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

  public serializeTeam(teamName: string): LooseObjectDto {
    const team = this.teamRepository.get(teamName);
    if (team) {
      const result: LooseObjectDto = {
        team: team.teamName,
        gameState: team.gameState,
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

  public serializeParticipants(): LooseObjectDto {
    const result = new Array<IServerParticipant>();
    this.participantRepository.getAll().map((p: IServerParticipant) => p.self);
    return result;
  }
  //#endregion
}
