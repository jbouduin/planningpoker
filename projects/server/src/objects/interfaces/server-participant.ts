import { IWebSocket } from "../../services/websocket";
import { IParticipant } from "../../../../shared-lib/src";

export interface IServerParticipant extends IParticipant {
  socket: IWebSocket;
  readonly self: IParticipant
}