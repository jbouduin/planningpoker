import { DtoEstimation, IEstimationsMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class EstimationsMessage extends ServerMessage<Array<DtoEstimation>> implements IEstimationsMessage {
  public constructor(data: Array<DtoEstimation>) {
    super(ServerMessageType.Estimation, data);
  }
}