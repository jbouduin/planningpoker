import { AServerMessage } from "../../../../shared-lib/lib";
import { Participant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface ISenderService {
  sendToParticipant(to: Participant, message: AServerMessage): void;
  sendToSocket(socket: IWebSocket, message: AServerMessage): void;
}