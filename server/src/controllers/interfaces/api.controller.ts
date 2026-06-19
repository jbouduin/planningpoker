import { ICanRejoinResponse, ICardSet } from "shared-lib";

export interface IApiController {
  availableCardSets(): Array<ICardSet>;
  canRejoin(teamName: string, participantId: string): ICanRejoinResponse;
}
