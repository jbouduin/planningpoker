import {
  CardSetDto,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  ESessionEndedReason,
  EstimationDto
} from 'shared-lib';
import type { IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';
import { IWebSocket } from '../websocket.js';

export interface IMessageService {
  broadcastCardSet(members: Array<IServerParticipant>, cardSet: CardSetDto): void;
  broadcastClearEstimations(members: Array<IServerParticipant>): void;
  broadcastEstimations(
    gameState: EGameState,
    members: Array<IServerParticipant>,
    estimations: Array<EstimationDto>
  ): void;
  broadcastEstimationWithDrawn(members: Array<IServerParticipant>, participantId: string): void;
  broadcastGameState(members: Array<IServerParticipant>, gameState: EGameState): void;
  broadcastMemberChange(
    members: Array<IServerParticipant>,
    changedMember: IServerParticipant,
    change: EParticipantChangeType
  ): void;
  broadcastSessionEnded(members: Array<IServerParticipant>, reason: ESessionEndedReason): void;
  sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void;
  sendEstimation(gameState: EGameState, to: IServerParticipant, estimations: Array<EstimationDto>): void;
  sendException(socket: IWebSocket, errorMessage: string): void;
  sendGameStateChanged(to: IServerParticipant, gameState: EGameState): void;
  sendStartHandshake(to: IServerParticipant): void;
  sendPing(to: IServerParticipant): void;
  sendSelf(to: IServerParticipant): void;
  sendHandshakeSequence(
    to: IServerParticipant,
    team: IServerTeam,
    members: Array<IServerParticipant>,
    cardSet: CardSetDto
  ): void;
}
