import { ECardSet, ICard } from "@shared-lib";

export interface ICardSetDialogParams {
  cardSets: Array<ECardSet>;
  currentCardSet: ECardSet | null;
  currentCards: Array<ICard> | null;
}