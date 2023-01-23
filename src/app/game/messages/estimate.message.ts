import { EClientMessageType, IEstimateMessage } from "@shared-lib";
import { ClientMessage } from "./client.message";

export class EstimateMessage extends ClientMessage<number> implements IEstimateMessage {
  public constructor(sender: string, data: number) {
    super(sender, EClientMessageType.Estimate, data);
  }
}
