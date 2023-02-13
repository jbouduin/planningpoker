import { ClientMessage } from "../../../../shared-lib/lib";
import { LooseObject, Participant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface IHandlerService {
  handleClose(ws: IWebSocket): void;
  handleConnect(ws: IWebSocket): Participant;
  handleCronTick(maxIdleTime: number): void;
  handleError(ws: IWebSocket, err: unknown): void;
  handleMessage(message: ClientMessage, team: string, ws: IWebSocket): void;
  handlePing(): void;
  handleReset(): LooseObject;
}