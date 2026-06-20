import {
  IEndSessionMessage,
  IErrorMessage,
  IInitMessage,
  IPingMessage,
  ISelfMessage,
  IServerResetMessage,
  ITeamIdleMessage,
  ITeamNameMessage
} from 'shared-lib';

export type SessionMessage =
  | IInitMessage
  | ISelfMessage
  | ITeamNameMessage
  | IPingMessage
  | IErrorMessage
  | IEndSessionMessage
  | ITeamIdleMessage
  | IServerResetMessage;
