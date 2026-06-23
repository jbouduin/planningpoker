import { AServerMessage, EServerMessageType } from 'shared-lib';
import { SessionMessage } from '../types';

export function isSessionMessage(msg: AServerMessage): msg is SessionMessage {
  return [
    EServerMessageType.Init,
    EServerMessageType.EndInit,
    EServerMessageType.Self,
    EServerMessageType.TeamName,
    EServerMessageType.Ping,
    EServerMessageType.Error,
    EServerMessageType.EndSession,
    EServerMessageType.TeamIdle,
    EServerMessageType.ServerReset
  ].includes(msg.type);
}
