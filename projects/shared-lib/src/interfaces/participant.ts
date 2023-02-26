import { EParticipantStatus } from './participant-status.enum';
import { ERole } from './role.enum';

export interface IParticipant {
  nick: string;
  participantId: string;
  observer: boolean;
  role: ERole;
  status: EParticipantStatus;
}
