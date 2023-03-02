import { AServerMessage } from "../../../../shared-lib/src";
import { IServerParticipant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface ISenderService {
  sendToParticipant(to: IServerParticipant, message: AServerMessage): void;
  sendToSocket(socket: IWebSocket, message: AServerMessage): void;
}