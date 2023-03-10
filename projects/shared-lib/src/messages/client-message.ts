import { ICardSet, ICreate, IJoin, IObserverChange } from '../interfaces';
import { EClientMessageType } from './client-message-type.enum';

export interface IClientMessage<T> {
  senderId: string;
  data: T;
  type: EClientMessageType
}

export type IChangeCardSetMessage = IClientMessage<ICardSet>;
export type IChangeNickMessage = IClientMessage<string>;
export type IChangeScrumMasterMessage = IClientMessage<string>;
export type ICreateMessage = IClientMessage<ICreate>;
export type IEstimateMessage = IClientMessage<number | undefined>;
export type IJoinMessage = IClientMessage<IJoin>;
export type ILeaveMessage = IClientMessage<string>;
export type IObserveMessage = IClientMessage<IObserverChange>;
export type IPauseMessage = IClientMessage<void>;
export type IRejoinMessage = IClientMessage<string>;
export type IRemoveMessage = IClientMessage<string>;
export type IRevealMessage = IClientMessage<void>;
export type IStartMessage = IClientMessage<void>;
export type AClientMessage =
  IChangeCardSetMessage |
  IChangeNickMessage |
  IChangeScrumMasterMessage |
  ICreateMessage |
  IEstimateMessage |
  IJoinMessage |
  IObserveMessage |
  IPauseMessage |
  ILeaveMessage |
  IRejoinMessage |
  IRemoveMessage |
  IRevealMessage |
  IStartMessage;