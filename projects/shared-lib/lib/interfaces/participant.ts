import { EParticipantStatus } from './participant-status.enum';
import { ERole } from './role.enum';

export interface IParticipant {
  status: EParticipantStatus;
  nick: string;
  uuid: string;
  role: ERole;
  observer: boolean;
}
