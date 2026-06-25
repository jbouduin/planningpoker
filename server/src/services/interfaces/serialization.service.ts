import { LooseObjectDto } from 'shared-lib';

export interface ISerializationService {
  serializeAllTeams(): LooseObjectDto;
  serializeTeam(teamname: string): LooseObjectDto;
  serializeParticipants(): LooseObjectDto;
}
