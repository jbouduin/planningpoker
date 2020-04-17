import { Role } from './role';

export interface DtoParticipant {
  connected: boolean;
  nick: string;
  uuid: string;
  role: Role;
}
