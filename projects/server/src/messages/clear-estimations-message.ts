import { IClearEstimationsMessage, EServerMessageType } from "../../../shared-lib/lib";
import { ServerMessage } from "./server-message";

export class ClearEstimationsMessage extends ServerMessage<void> implements IClearEstimationsMessage {
  public constructor() {
    super(EServerMessageType.ClearEstimations, undefined);
  }
}