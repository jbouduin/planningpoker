import { ICreate, IJoin, IObserverChange } from '../interfaces';
import { EClientMessageType } from './client-message-type.enum';

export interface IClientMessage<T> {
  senderUuid: string;
  data: T;
  type: EClientMessageType
}

export type IChangeNickMessage = IClientMessage<string>;
export type ICreatemessage = IClientMessage<ICreate>;
export type IDisconnectMessage = IClientMessage<void>;
export type IEstimateMessage = IClientMessage<number>;
export type IJoinMessage = IClientMessage<IJoin>;
export type ILeaveMessage = IClientMessage<void>;
export type IObserveMessage = IClientMessage<IObserverChange>;
export type IPauseMessage = IClientMessage<void>;
export type IRejoinMessage = IClientMessage<string>;
export type IRevealMessage = IClientMessage<void>;
export type IStartMessage = IClientMessage<void>;
export type ClientMessage =
  IChangeNickMessage |
  ICreatemessage |
  IDisconnectMessage |
  IEstimateMessage |
  IJoinMessage |
  IObserveMessage |
  IPauseMessage |
  ILeaveMessage |
  IRejoinMessage |
  IRevealMessage |
  IStartMessage;