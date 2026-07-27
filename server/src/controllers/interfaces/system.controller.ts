import { LooseObjectDto } from 'shared-lib';

export interface ISystemController {
  deleteTeam(teamname: string): LooseObjectDto;
  disconnectParticipant(participantId: string): LooseObjectDto;
  resetServer(): LooseObjectDto;
  getTeam(teamName: string): LooseObjectDto;
  getAllTeams(): LooseObjectDto;
  getParticipants(): LooseObjectDto;
}
