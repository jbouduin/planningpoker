import { ICard } from "../../../../shared-lib/lib";

export interface ICardService {
  readonly unknownEstimationIndex: number;
  generateCardSet(): Array<ICard>;

}