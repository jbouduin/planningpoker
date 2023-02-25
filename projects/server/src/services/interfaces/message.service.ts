import { EErrorCode, EMemberStatusChange, EPokerStatus, ICardSet } from "../../../../shared-lib/src";
import { Estimation, ITeam, Participant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface IMessageService {
  broadcastAllEstimations(members: Array<Participant>, estimations: Array<Estimation>, teamStatus: EPokerStatus): void;
  broadcastCardSet(members: Array<Participant>, cardSet: ICardSet): void;
  broadcastClearEstimations(members: Array<Participant>): void;
  broadcastEstimation(members: Array<Participant>, estimation: Estimation, teamStatus: EPokerStatus): void;
  broadcastPokerStatus(members: Array<Participant>, status: EPokerStatus): void;
  broadcastMemberChange(members: Array<Participant>, changedMember: Participant, change: EMemberStatusChange): void;
  broadcastSessionEnded(members: Array<Participant>): void;
  sendErrorMessageToParticipant(to: Participant, code: EErrorCode): void;
  sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void;
  sendException(socket: IWebSocket, errorMessage: string): void;
  sendInit(to: Participant): void;
  sendLeft(to: Participant): void;
  sendPing(to: Participant): void;
  sendReset(to: Participant): void;
  sendSelf(to: Participant): void;
  sendSessionEnded(to: Participant): void;
  sendTeamIdleMessage(to: Participant): void;
  sendAllInfo(to: Participant, team: ITeam, members: Array<Participant>, cardSet: ICardSet,estimations: Array<Estimation>): void;
}