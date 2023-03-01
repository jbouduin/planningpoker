import { ICardSet } from "./card-set";
import { ECardSet } from "./card-set.enum";
// TODO 2368 take team out of the data
export interface ICreate {
  team: string;
  observer: boolean;
  nick: string;
  cardSet: ECardSet;
  cards?: ICardSet;
}
