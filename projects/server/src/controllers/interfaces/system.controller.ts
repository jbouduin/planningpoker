import { Response } from 'express';

export interface ISystemController {
  canRejoin(teamName: string, uuid: string, response: Response): void;
  disconnectParticipant(uuid: string, response: Response): void;
  resetServer(response: Response): void;
  getTeam(teamName: string, response: Response): void;
  getAllTeams(response: Response): void;
  getParticipants(response: Response): void;
}