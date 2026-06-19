import { ICardSetMessage, IClearEstimationsMessage, IEstimationListMessage, IPokerStatusChangedMessage, IServerResetMessage, ITeamIdleMessage } from "shared-lib";

export type GameMessage = ICardSetMessage |
  IEstimationListMessage |
  IClearEstimationsMessage |
  IPokerStatusChangedMessage |
  ITeamIdleMessage |
  IServerResetMessage;
