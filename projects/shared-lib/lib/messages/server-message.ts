import { ICard, IError, IEstimation, IParticipant, ITeamInfo } from "../interfaces";
import { ITeamStatus } from "../interfaces/team-status";
import { ServerMessageType } from "./server-message-type";

export interface IServerMessage<T> {
  data: T,
  type: ServerMessageType;
}

export type ICardSetMessage = IServerMessage<Array<ICard>>;
export type IClearEstimationsMessage = IServerMessage<string>;
export type IEndOfGameMessage= IServerMessage<string>;
export type IErrorMessage= IServerMessage<IError>;
export type IEstimationsMessage= IServerMessage<Array<IEstimation>>;
export type IInitMessage= IServerMessage<IParticipant>;
export type IParticipantListMessage= IServerMessage<Array<IParticipant>>;
export type IPingMessage= IServerMessage<string>;
export type ISelfMessage= IServerMessage<IParticipant>;
export type IServerResetMessage= IServerMessage<string>;
export type ITeamStatusMessage= IServerMessage<ITeamStatus>;
export type ITeamMessage = IServerMessage<ITeamInfo>;
export type ServerMessage =
  ICardSetMessage |
  IClearEstimationsMessage |
  IEndOfGameMessage |
  IErrorMessage |
  IEstimationsMessage |
  IInitMessage |
  IParticipantListMessage |
  IPingMessage |
  ISelfMessage |
  IServerResetMessage |
  ITeamStatusMessage |
  ITeamMessage;