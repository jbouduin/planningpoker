import { IMemberChangeMessage, IMemberListMessage, IServerResetMessage, ITeamIdleMessage } from "shared-lib";

export type TeamMessage = IMemberListMessage |
  IMemberChangeMessage |
  ITeamIdleMessage |
  IServerResetMessage;
