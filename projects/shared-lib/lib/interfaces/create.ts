import { ECardSet } from "./card-set.enum";

export interface ICreate {
  team: string;
  observer: boolean;
  nick: string;
  cardSet: ECardSet;
}
