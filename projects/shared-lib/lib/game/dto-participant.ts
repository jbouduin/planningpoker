import { ParticipantStatus } from './participant-status';
import { Role } from './role';

export interface DtoParticipant {
  status: ParticipantStatus;
  nick: string;
  uuid: string;
  role: Role;
  observer: boolean;
}
