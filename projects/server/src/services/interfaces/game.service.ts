import * as expressWs from 'express-ws';

export interface IGameService {
  canRejoin(teamName: string, uuid: string): string;
  disconnectParticipant(participantUuid: string): string;
  initializeService(expressWS: expressWs.Instance): void;
  reset(): string;
  serializeAllTeams(): string;
  serializeTeam(teamname: string): string;
  serializeParticipants(): string;
}