import { ICardSet } from "../../../../shared-lib/lib";
import { LooseObject } from "../../objects";

export interface IApiController {
  availableCardSets(): Array<ICardSet>;
  canRejoin(teamName: string, uuid: string): LooseObject;
}