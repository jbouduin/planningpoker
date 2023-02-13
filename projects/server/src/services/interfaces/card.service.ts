import { ECardSet, ICardSet } from "../../../../shared-lib/lib";

export interface ICardService {
  getCardSet(set: ECardSet): ICardSet;
}