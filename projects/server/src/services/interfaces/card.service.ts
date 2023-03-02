import { ECardSet, ICardSet } from "../../../../shared-lib/src";

export interface ICardService {
  getCardSet(set: ECardSet): ICardSet;
}