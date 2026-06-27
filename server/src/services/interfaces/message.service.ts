import { CardSetDto, EErrorCode, EGameState, EParticipantChangeType, EstimationDto } from 'shared-lib';
import type { IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';
import { IWebSocket } from '../websocket.js';

export interface IMessageService {
  broadcastCardSet(members: Array<IServerParticipant>, cardSet: CardSetDto): void;
  broadcastClearEstimations(members: Array<IServerParticipant>): void;
  broadcastEstimations(members: Array<IServerParticipant>, estimations: Array<EstimationDto>): void;
  broadcastGameState(members: Array<IServerParticipant>, gameState: EGameState): void;
  broadcastMemberChange(
    members: Array<IServerParticipant>,
    changedMember: IServerParticipant,
    change: EParticipantChangeType
  ): void;
  broadcastReset(members: Array<IServerParticipant>): void;
  broadcastSessionEnded(members: Array<IServerParticipant>): void;
  broadcastTeamIdle(members: Array<IServerParticipant>): void;
  sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void;
  sendEstimations(to: IServerParticipant, estimations: Array<EstimationDto>): void;
  sendException(socket: IWebSocket, errorMessage: string): void;
  sendGameStateChanged(to: IServerParticipant, gameState: EGameState): void;
  sendInit(to: IServerParticipant): void;
  sendPing(to: IServerParticipant): void;
  sendSelf(to: IServerParticipant): void;
  sendInitSequence(
    to: IServerParticipant,
    team: IServerTeam,
    members: Array<IServerParticipant>,
    cardSet: CardSetDto
  ): void;
}
