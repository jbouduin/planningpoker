import { IWebSocket } from "../websocket";
import { EErrorCode, EMemberStatusChange, ICardSet } from "../../../../shared-lib/lib";
import { Estimation, ITeam, Participant } from "../../objects";

export interface IMessageService {
  broadcastAllEstimations(team: ITeam): void;
  broadcastCardSet(team: ITeam, cardSet: ICardSet): void;
  broadcastClearEstimations(team: ITeam): void;
  broadcastEstimation(team: ITeam, estimation: Estimation): void;
  broadcastPokerStatus(team: ITeam): void;
  broadcastMemberChange(team: ITeam, changedMember: Participant, change: EMemberStatusChange): void;
  broadcastSessionEnded(team: ITeam, participant: Participant): void;
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
  sendTeamInfo(to: Participant, game: ITeam): void;
}