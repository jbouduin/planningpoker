import { LooseObject } from '../../objects';

export interface ISystemController {
  deleteTeam(teamname: string): LooseObject;
  disconnectParticipant(participantId: string): LooseObject;
  resetServer(): LooseObject;
  getTeam(teamName: string): LooseObject;
  getAllTeams(): LooseObject;
  getParticipants(): LooseObject;
}
