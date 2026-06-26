import {
  IClearEstimationsMessage,
  IEstimationListMessage,
  IGameStateChangedMessage,
  IServerResetMessage
} from 'shared-lib';

export type PokerMessage =
  | IEstimationListMessage
  | IClearEstimationsMessage
  | IGameStateChangedMessage
  | IServerResetMessage;
