import { ICardSet } from 'shared-lib';

export interface ICardSetRepository {
  removeCardSet(teamName: string): boolean;
  getCardSet(teamName: string): ICardSet | undefined;
  setCardSet(teamName: string, cardSet: ICardSet): void;
}
