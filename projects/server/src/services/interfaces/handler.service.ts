import { AClientMessage } from "../../../../shared-lib/src";
import { LooseObject, Participant } from "../../objects";
import { IWebSocket } from "../websocket";

export interface IHandlerService {
  handleClose(ws: IWebSocket): void;
  handleConnect(ws: IWebSocket): Participant;
  handleCronTick(maxIdleTime: number): void;
  handleError(ws: IWebSocket, err: Error): void;
  handleMessage(message: AClientMessage, team: string, ws: IWebSocket): void;
  handlePing(): void;
  handleReset(): LooseObject;
}