import { ClientMessage } from "../../../../shared-lib/lib";
import { Participant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface IHandlerService {
  handleClose(ws: IWebSocket): void;
  handleConnect(ws: IWebSocket): Participant;
  handleError(ws: IWebSocket, err: unknown): void;
  handleMessage(message: ClientMessage, team: string, ws: IWebSocket): void;
  handlePing(): void;
  handleReset(): string;
}