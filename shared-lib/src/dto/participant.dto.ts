import { EParticipantState } from './participant-state.enum';
import { ERole } from './role.enum';

export interface ParticipantDto {
  nick: string;
  readonly participantId: string;
  observer: boolean;
  role: ERole;
  state: EParticipantState;
}
