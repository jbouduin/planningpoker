import { ServerMessage } from "../../../../shared-lib/lib";
import { Participant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface ISenderService {
  sendToParticipant(to: Participant, message: ServerMessage): void;
  sendToSocket(socket: IWebSocket, message: ServerMessage): void;
}