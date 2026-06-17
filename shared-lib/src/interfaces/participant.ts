import { EParticipantStatus } from './participant-status.enum';
import { ERole } from './role.enum';

export interface IParticipant {
  nick: string;
  readonly participantId: string;
  observer: boolean;
  role: ERole;
  status: EParticipantStatus;
}
