import { AServerMessage, EServerMessageType } from 'shared-lib';
import { PokerMessage } from '../types';

export function isPokerMessage(msg: AServerMessage): msg is PokerMessage {
  return [
    EServerMessageType.EndSession,
    EServerMessageType.EstimationList,
    EServerMessageType.ClearEstimations,
    EServerMessageType.PokerStatus,
    EServerMessageType.ServerReset
  ].includes(msg.type);
}
