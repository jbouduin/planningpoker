import { EPokerStatus, ICardSet, IError, IEstimation, IParticipant } from '../interfaces';
import { IMemberChange } from '../interfaces/member-change';
import { EServerMessageType } from './server-message-type.enum';

export interface IServerMessage<T> {
  data: T;
  type: EServerMessageType;
}

export type ICardSetMessage = IServerMessage<ICardSet>;
export type IClearEstimationsMessage = IServerMessage<void>;
export type IEndSessionMessage = IServerMessage<void>;
export type IEndInitMessage = IServerMessage<void>;
export type IErrorMessage = IServerMessage<IError>;
export type IEstimationListMessage = IServerMessage<Array<IEstimation>>;
export type IInitMessage = IServerMessage<IParticipant>;
export type IMemberChangeMessage = IServerMessage<IMemberChange>;
export type IMemberListMessage = IServerMessage<Array<IParticipant>>;
export type IPingMessage = IServerMessage<void>;
export type IPokerStatusChangedMessage = IServerMessage<EPokerStatus>;
export type ISelfMessage = IServerMessage<IParticipant>;
export type IServerResetMessage = IServerMessage<void>;
export type ITeamIdleMessage = IServerMessage<void>;
export type ITeamNameMessage = IServerMessage<string>;
export type AServerMessage =
  | ICardSetMessage
  | IClearEstimationsMessage
  | IEndSessionMessage
  | IErrorMessage
  | IEstimationListMessage
  | IInitMessage
  | IEndInitMessage
  | IMemberChangeMessage
  | IMemberListMessage
  | IPingMessage
  | IPokerStatusChangedMessage
  | ISelfMessage
  | IServerResetMessage
  | ITeamIdleMessage
  | ITeamNameMessage;
