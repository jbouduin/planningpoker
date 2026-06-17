import { ICardSet } from "shared-lib";
import { LooseObject } from "../../objects";

export interface IApiController {
  availableCardSets(): Array<ICardSet>;
  canRejoin(teamName: string, participantId: string): LooseObject;
}
