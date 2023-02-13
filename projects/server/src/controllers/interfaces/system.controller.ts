import { LooseObject } from '../../objects';

export interface ISystemController {
  disconnectParticipant(uuid: string): LooseObject;
  resetServer(): LooseObject;
  getTeam(teamName: string): LooseObject;
  getAllTeams(): LooseObject;
  getParticipants(): LooseObject;
}