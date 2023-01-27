import { EGameStatus, EPokerStatus, ICard, IError, IEstimation, IParticipant } from "../interfaces";
import { IMemberStatusChange } from "../interfaces/member-status-change";
import { EServerMessageType } from "./server-message-type.enum";

export interface IServerMessage<T> {
  data: T,
  type: EServerMessageType;
}

export type ICardSetMessage = IServerMessage<Array<ICard>>;
export type IClearEstimationsMessage = IServerMessage<string>;
export type IEndSessionMessage = IServerMessage<string>;
export type IErrorMessage = IServerMessage<IError>;
export type IEstimationsMessage = IServerMessage<Array<IEstimation>>;
export type IGameStatusMessage = IServerMessage<EGameStatus>;
export type IInitMessage = IServerMessage<IParticipant>;
export type IMemberChangedMessage = IServerMessage<IMemberStatusChange>;
export type IMemberListMessage = IServerMessage<Array<IParticipant>>;
export type IPingMessage = IServerMessage<string>;
export type IPokerStatusChangedMessage = IServerMessage<EPokerStatus>;
export type ISelfMessage = IServerMessage<IParticipant>;
export type IServerResetMessage = IServerMessage<string>;
export type ITeamNameMessage = IServerMessage<string>;
export type ServerMessage =
  ICardSetMessage |
  IClearEstimationsMessage |
  IEndSessionMessage |
  IErrorMessage |
  IEstimationsMessage |
  IGameStatusMessage |
  IInitMessage |
  IMemberChangedMessage |
  IMemberListMessage |
  IPingMessage |
  IPokerStatusChangedMessage |
  ISelfMessage |
  IServerResetMessage |
  ITeamNameMessage;