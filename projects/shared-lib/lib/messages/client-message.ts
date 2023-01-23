import { ICreate, IJoin } from '../interfaces';
import { ClientMessageType } from './client-message-type';

export interface IClientMessage<T> {
  senderUuid: string;
  data: T;
  type: ClientMessageType
}

export type ICreatemessage = IClientMessage<ICreate>;
export type IDisconnectMessage = IClientMessage<string>;
export type IEstimateMessage = IClientMessage<number>;
export type IJoinMessage = IClientMessage<IJoin>;
export type ILeaveMessage = IClientMessage<string>;
export type IRejoinMessage = IClientMessage<string>;
export type IRevealMessage = IClientMessage<string>;
export type ISetNickMessage = IClientMessage<string>;
export type IStartMessage = IClientMessage<string>;
export type ClientMessage =
  ICreatemessage |
  IDisconnectMessage |
  IEstimateMessage |
  IJoinMessage |
  ILeaveMessage |
  IRejoinMessage |
  IRevealMessage |
  ISetNickMessage |
  IStartMessage;