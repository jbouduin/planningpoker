import { CardDto } from 'shared-lib';
import { Member } from '../../../core';

export interface IDisplayCard {
  isAvailable: boolean;
  card: CardDto | null;
  enabled: boolean;
  intent: 'none' | 'primary';
  member: Member | null;
}
