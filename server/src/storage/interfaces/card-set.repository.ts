import { CardSetDto } from 'shared-lib';

export interface ICardSetRepository {
  removeCardSet(teamName: string): boolean;
  getCardSet(teamName: string): CardSetDto | undefined;
  setCardSet(teamName: string, cardSet: CardSetDto): void;
}
