import { EErrorCode, EMemberChangeType, EPokerStatus, ICardSet, IEstimation } from "../../../../shared-lib/src";
import { ITeam, IServerParticipant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface IMessageService {
  broadcastCardSet(members: Array<IServerParticipant>, cardSet: ICardSet): void;
  broadcastClearEstimations(members: Array<IServerParticipant>): void;
  broadcastPokerStatus(members: Array<IServerParticipant>, status: EPokerStatus): void;
  broadcastMemberChange(members: Array<IServerParticipant>, changedMember: IServerParticipant, change: EMemberChangeType): void;
  broadcastReset(members: Array<IServerParticipant>): void;
  broadcastSessionEnded(members: Array<IServerParticipant>): void;
  broadcastTeamIdle(members: Array<IServerParticipant>): void;
  sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void;
  sendEstimations(to: IServerParticipant, estimations: Array<IEstimation>): void
  sendException(socket: IWebSocket, errorMessage: string): void;
  sendInit(to: IServerParticipant): void;
  sendLeft(to: IServerParticipant): void;
  sendPing(to: IServerParticipant): void;
  sendSelf(to: IServerParticipant): void;
  sendAllInfo(to: IServerParticipant, team: ITeam, members: Array<IServerParticipant>, cardSet: ICardSet, estimations: Array<IEstimation>): void;
}