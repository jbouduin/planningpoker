import { AServerMessage, EServerMessageType } from "shared-lib";
import { GameMessage } from "../types";

export function isGameMessage(msg: AServerMessage): msg is GameMessage {
  return [
    EServerMessageType.CardList,
    EServerMessageType.EstimationList,
    EServerMessageType.ClearEstimations,
    EServerMessageType.PokerStatus,
    EServerMessageType.TeamIdle,
    EServerMessageType.ServerReset
  ].includes(msg.type);
}
