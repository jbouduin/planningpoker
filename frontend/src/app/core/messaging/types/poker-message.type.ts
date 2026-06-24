import {
  IClearEstimationsMessage,
  IEstimationListMessage,
  IPokerStatusChangedMessage,
  IServerResetMessage
} from 'shared-lib';

export type PokerMessage =
  | IEstimationListMessage
  | IClearEstimationsMessage
  | IPokerStatusChangedMessage
  | IServerResetMessage;
