import { AServerMessage, EServerMessageType } from 'shared-lib';
import { GameMessage } from '../types';

export function isGameMessage(msg: AServerMessage): msg is GameMessage {
  return [
    EServerMessageType.CardSet,
    EServerMessageType.EndSession,
    EServerMessageType.EstimationList,
    EServerMessageType.ClearEstimations,
    EServerMessageType.GameStateChanged,
    EServerMessageType.TeamIdle,
    EServerMessageType.ServerReset
  ].includes(msg.type);
}
