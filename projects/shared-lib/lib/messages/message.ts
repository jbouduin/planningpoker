import { DtoParticipant } from '../game';
import { MessageType } from './messagetype';
import { Verb } from './verb';


// TODO: different interface for client and server message (with inheritance)
export interface Message {
    type: MessageType | Verb;
    data: any, // DtoParticipant | DtoGame | string;
    uuid: string
}
