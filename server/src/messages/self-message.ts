import { IParticipant, ISelfMessage, EServerMessageType } from 'shared-lib';
import { ServerMessage } from './server-message';

export class SelfMessage extends ServerMessage<IParticipant> implements ISelfMessage {
  public constructor(data: IParticipant) {
    super(EServerMessageType.Self, data);
  }
}
