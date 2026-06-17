import { inject, injectable } from "inversify";

import { AServerMessage } from "shared-lib";

import SERVICETYPES from "../service.types";

import { IServerParticipant } from "../../objects";
import { ILoggerService, ISenderService } from "../interfaces";
import { IWebSocket, ReadyState } from "../websocket";

@injectable()
export class SenderService implements ISenderService{

  //#region private properties ------------------------------------------------
  private readonly loggerService: ILoggerService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.LoggerService) loggerService: ILoggerService) {
    this.loggerService = loggerService;
  }
  //#endregion

  //#region ISenderService methods --------------------------------------------
  public sendToParticipant(to: IServerParticipant, message: AServerMessage): void {
    this.loggerService.info('Socket', `${to.nick} => ${message.type} - ${JSON.stringify(message)}`);
    this.send(to.socket, message);
  }

  public sendToSocket(socket: IWebSocket, message: AServerMessage): void {
    this.loggerService.info('Socket', `socket => ${message.type} - ${JSON.stringify(message)}`);
    this.send(socket, message);
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private send(socket: IWebSocket, message: AServerMessage): void {
    if (socket.readyState === ReadyState.OPEN) {
      try {
        socket.send(JSON.stringify(message));
      } catch (err: unknown) {
        this.loggerService.error('Socket', `${err}`); // eslint-disable-line
      }
    } else {
      this.loggerService.error('Socket', `Readystate is ${ ReadyState[socket.readyState]}`);
    }
  }
  //#endregion
}
