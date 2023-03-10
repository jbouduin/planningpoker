import { IEstimation, IEstimationListMessage, EServerMessageType } from "../../../shared-lib/src";
import { ServerMessage } from "./server-message";

export class EstimationListMessage extends ServerMessage<Array<IEstimation>> implements IEstimationListMessage {
  public constructor(data: Array<IEstimation>) {
    super(EServerMessageType.EstimationList, data);
  }
}