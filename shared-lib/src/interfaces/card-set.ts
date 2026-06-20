import { ICard } from './card';
import { ECardSet } from './card-set.enum';

export interface ICardSet {
  cards: Array<ICard>;
  cardSet: ECardSet;
}
