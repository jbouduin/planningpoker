import { DtoParticipant } from '../game';
import { MessageType } from './messagetype';
import { Verb } from './verb';

export interface Message {
    type: MessageType | Verb;
    data: any, // DtoParticipant | string;
    uuid: string
}
