import { DtoCard, DtoError, DtoEstimation, DtoParticipant, DtoTeam } from "../game";
import { DtoStatus } from "../game/dto-status";
import { ServerMessageType } from "./server-message-type";

export interface IServerMessage<T> {
  data: T,
  type: ServerMessageType;
}

export type ICardSetMessage = IServerMessage<Array<DtoCard>>;
export type IClearEstimationsMessage = IServerMessage<string>;
export type IEndOfGameMessage= IServerMessage<string>;
export type IErrorMessage= IServerMessage<DtoError>;
export type IEstimationsMessage= IServerMessage<Array<DtoEstimation>>;
export type IInitMessage= IServerMessage<DtoParticipant>;
export type IParticipantListMessage= IServerMessage<Array<DtoParticipant>>;
export type IPingMessage= IServerMessage<string>;
export type ISelfMessage= IServerMessage<DtoParticipant>;
export type IServerResetMessage= IServerMessage<string>;
export type ITeamStatusMessage= IServerMessage<DtoStatus>;
export type ITeamMessage = IServerMessage<DtoTeam>;
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