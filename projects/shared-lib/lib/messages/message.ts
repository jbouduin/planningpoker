import { MessageType } from './messagetype';
import { Reason } from './reason';

export interface Message {
    data: any, // DtoParticipant | DtoGame | string;
    reason: Reason,
    type: MessageType;
    uuid: string
}
