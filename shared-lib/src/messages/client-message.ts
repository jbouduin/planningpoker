import { CardSetDto, CreateDto, JoinDto, ObserverChangeDto } from '../dto';
import { EClientMessageType } from './client-message-type.enum';

export interface IClientMessage<T> {
  data: T;
  senderId: string;
  type: EClientMessageType;
}

export type IChangeCardSetMessage = IClientMessage<CardSetDto>;
export type IChangeNickMessage = IClientMessage<string>;
export type IChangeScrumMasterMessage = IClientMessage<string>;
export type ICreateMessage = IClientMessage<CreateDto>;
export type IEstimateMessage = IClientMessage<number>;
export type IJoinMessage = IClientMessage<JoinDto>;
export type ILeaveMessage = IClientMessage<string>;
export type IObserveMessage = IClientMessage<ObserverChangeDto>;
export type IPauseMessage = IClientMessage<void>;
export type IRejoinMessage = IClientMessage<string>;
export type IRemoveMessage = IClientMessage<string>;
export type IRevealMessage = IClientMessage<void>;
export type IStartMessage = IClientMessage<void>;
export type IWithDrawMessage = IClientMessage<void>;

export type AClientMessage =
  | IChangeCardSetMessage
  | IChangeNickMessage
  | IChangeScrumMasterMessage
  | ICreateMessage
  | IEstimateMessage
  | IJoinMessage
  | IObserveMessage
  | IPauseMessage
  | ILeaveMessage
  | IRejoinMessage
  | IRemoveMessage
  | IRevealMessage
  | IStartMessage
  | IWithDrawMessage;
