import { IEstimation, IEstimationsMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class EstimationsMessage extends ServerMessage<Array<IEstimation>> implements IEstimationsMessage {
  public constructor(data: Array<IEstimation>) {
    super(ServerMessageType.Estimation, data);
  }
}