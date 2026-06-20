import { AServerMessage, EServerMessageType } from 'shared-lib';
import { TeamMessage } from '../types';

export function isTeamMessage(msg: AServerMessage): msg is TeamMessage {
  return [
    EServerMessageType.EndSession,
    EServerMessageType.MemberList,
    EServerMessageType.MemberChanged,
    EServerMessageType.TeamIdle,
    EServerMessageType.ServerReset
  ].includes(msg.type);
}
