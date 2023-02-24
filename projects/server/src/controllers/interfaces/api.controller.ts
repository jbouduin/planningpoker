import { ICardSet } from "../../../../shared-lib/src";
import { LooseObject } from "../../objects";

export interface IApiController {
  availableCardSets(): Array<ICardSet>;
  canRejoin(teamName: string, uuid: string): LooseObject;
}