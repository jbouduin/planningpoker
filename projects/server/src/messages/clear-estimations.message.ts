import { IClearEstimationsMessage, ServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class ClearEstimationsMessage extends ServerMessage<string> implements IClearEstimationsMessage {
  public constructor() {
    super(ServerMessageType.ClearEstimations, '');
  }
}