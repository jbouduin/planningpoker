import { CardSetDto } from './card-set.dto';
import { ECardSetType } from './card-set-type.enum';

export interface CreateDto {
  observer: boolean;
  nick: string;
  cardSet: ECardSetType;
  cards?: CardSetDto;
}
