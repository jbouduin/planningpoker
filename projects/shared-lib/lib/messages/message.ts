import { DtoParticipant } from '../game';
import { MessageType } from './messagetype';
import { Verb } from './verb';
import { Reason } from './reason';

export interface Message {
    data: any, // DtoParticipant | DtoGame | string;
    reason: Reason,
    type: MessageType | Verb;
    uuid: string
}
