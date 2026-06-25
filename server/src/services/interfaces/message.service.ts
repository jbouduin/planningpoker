import { CardSetDto, EErrorCode, EGameState, EParticipantChangeType, EstimationDto } from 'shared-lib';
import { IServerParticipant, IServerTeam } from '../../objects';
import { IWebSocket } from '../websocket';

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
  sendException(socket: IWebSocket, errorMessage: string): void;
  sendInit(to: IServerParticipant): void;
  sendPing(to: IServerParticipant): void;
  sendSelf(to: IServerParticipant): void;
  sendAllInfo(
    to: IServerParticipant,
    team: IServerTeam,
    members: Array<IServerParticipant>,
    cardSet: CardSetDto,
    estimations: Array<EstimationDto> | null
  ): void;
}
