import { EGameState, CardSetDto, ErrorDto, EstimationDto, ParticipantDto } from '../dto';
import { ParticipantChangeDto } from '../dto/participant-change.dto';
import { EServerMessageType } from './server-message-type.enum';

export interface IServerMessage<T> {
  data: T;
  type: EServerMessageType;
}

export type ICardSetMessage = IServerMessage<CardSetDto>;
export type IClearEstimationsMessage = IServerMessage<void>;
export type IEndInitMessage = IServerMessage<void>;
export type IEndSessionMessage = IServerMessage<void>;
export type IErrorMessage = IServerMessage<ErrorDto>;
export type IEstimationListMessage = IServerMessage<Array<EstimationDto>>;
export type IInitMessage = IServerMessage<ParticipantDto>;
export type IParticipantChangedMessage = IServerMessage<ParticipantChangeDto>;
export type IParticipantListMessage = IServerMessage<Array<ParticipantDto>>;
export type IPingMessage = IServerMessage<void>;
export type IGameStateChangedMessage = IServerMessage<EGameState>;
export type ISelfMessage = IServerMessage<ParticipantDto>;
export type IServerResetMessage = IServerMessage<void>;
export type ITeamIdleMessage = IServerMessage<void>;
export type ITeamNameMessage = IServerMessage<string>;
export type IEstimationWithdrawnMessage = IServerMessage<string>;

export type AServerMessage =
  | ICardSetMessage
  | IClearEstimationsMessage
  | IEndSessionMessage
  | IErrorMessage
  | IEstimationListMessage
  | IInitMessage
  | IEndInitMessage
  | IParticipantChangedMessage
  | IParticipantListMessage
  | IPingMessage
  | IGameStateChangedMessage
  | ISelfMessage
  | IServerResetMessage
  | ITeamIdleMessage
  | ITeamNameMessage
  | IEstimationWithdrawnMessage;
