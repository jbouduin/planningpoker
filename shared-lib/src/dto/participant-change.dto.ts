import { EParticipantChangeType } from './participant-change-type.enum';
import { ParticipantDto } from './participant.dto';

export interface ParticipantChangeDto {
  changeType: EParticipantChangeType;
  member: ParticipantDto;
}
