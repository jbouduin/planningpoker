import { ICardSet } from "./card-set";
import { ECardSet } from "./card-set.enum";

export interface ICreate {
  observer: boolean;
  nick: string;
  cardSet: ECardSet;
  cards?: ICardSet;
}
