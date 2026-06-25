import { CardDto } from './card.dto';
import { ECardSetType } from './card-set-type.enum';

export interface CardSetDto {
  cards: Array<CardDto>;
  cardSet: ECardSetType;
}
