import { EGameStatus, ICard, IError, IEstimation, IParticipant } from "../interfaces";
import { IMemberStatusChange } from "../interfaces/member-status-change";
import { ITeamInfo } from "../interfaces/team-info";
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
export type IPingMessage = IServerMessage<string>;
export type ISelfMessage = IServerMessage<IParticipant>;
export type IServerResetMessage = IServerMessage<string>;
export type ITeamInfoMessage = IServerMessage<ITeamInfo>;
export type ServerMessage =
  ICardSetMessage |
  IClearEstimationsMessage |
  IEndSessionMessage |
  IErrorMessage |
  IEstimationsMessage |
  IGameStatusMessage |
  IInitMessage |
  IMemberChangedMessage |
  IPingMessage |
  ISelfMessage |
  IServerResetMessage |
  ITeamInfoMessage;