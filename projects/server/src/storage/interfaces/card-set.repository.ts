import { ICardSet } from "../../../../shared-lib/src";

export interface ICardSetRepository {
  removeCardSet(teamName: string): boolean;
  getCardSet(teamName: string): ICardSet | undefined;
  setCardSet(teamName: string, cardSet: ICardSet): void;
}