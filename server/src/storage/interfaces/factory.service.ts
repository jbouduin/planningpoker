import { ECardSetType, CardSetDto, EstimationDto } from 'shared-lib';
import type { IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';
import { IWebSocket } from '../../services/websocket.js';

export interface IFactoryService {
  createCardSet(set: ECardSetType): CardSetDto;
  createEstimation(participantId: string, cardIndex: number | null): EstimationDto;
  createParticipant(socket: IWebSocket): IServerParticipant;
  createTeam(teamName: string): IServerTeam;
}
