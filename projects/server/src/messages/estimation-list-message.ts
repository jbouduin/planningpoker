import { IEstimation, IEstimationsMessage, EServerMessageType } from "../../../shared-lib/src";
import { ServerMessage } from "./server-message";

export class EstimationListMessage extends ServerMessage<Array<IEstimation>> implements IEstimationsMessage {
  public constructor(data: Array<IEstimation>) {
    super(EServerMessageType.EstimationList, data);
  }
}