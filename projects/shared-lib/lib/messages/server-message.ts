import { EGameStatus, ICard, IError, IEstimation, IParticipant } from "../interfaces";
import { ITeamInfo } from "../interfaces/team-info";
import { EServerMessageType } from "./server-message-type.enum";

export interface IServerMessage<T> {
  data: T,
  type: EServerMessageType;
}

export type ICardSetMessage = IServerMessage<Array<ICard>>;
export type IClearEstimationsMessage = IServerMessage<string>;
export type IDissolveTeamMessage = IServerMessage<string>;
export type IErrorMessage = IServerMessage<IError>;
export type IEstimationsMessage = IServerMessage<Array<IEstimation>>;
export type IGameStatusMessage = IServerMessage<EGameStatus>;
export type IInitMessage = IServerMessage<IParticipant>;
export type IMemberListMessage = IServerMessage<Array<IParticipant>>;
export type IPingMessage = IServerMessage<string>;
export type ISelfMessage = IServerMessage<IParticipant>;
export type IServerResetMessage = IServerMessage<string>;
export type ITeamInfoMessage = IServerMessage<ITeamInfo>;
export type ServerMessage =
  ICardSetMessage |
  IClearEstimationsMessage |
  IDissolveTeamMessage |
  IErrorMessage |
  IEstimationsMessage |
  IGameStatusMessage |
  IInitMessage |
  IMemberListMessage |
  IPingMessage |
  ISelfMessage |
  IServerResetMessage |
  ITeamInfoMessage;