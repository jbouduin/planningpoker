import { ECardSetType, CardSetDto, EstimationDto } from 'shared-lib';

import { IServerParticipant, IServerTeam } from '../../objects';
import { IWebSocket } from '../../services/websocket';

export interface IFactoryService {
  createCardSet(set: ECardSetType): CardSetDto;
  createEstimation(participantId: string, cardIndex: number | undefined): EstimationDto;
  createParticipant(socket: IWebSocket): IServerParticipant;
  createTeam(teamName: string): IServerTeam;
}
