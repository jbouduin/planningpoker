import { Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';

import SERVICETYPES from '../service.types';

import { AClientMessage } from '../../../../shared-lib/lib';
import { ISocketService, IHandlerService, ILoggerService } from '../interfaces';


@injectable()
export class SocketService implements ISocketService {

  //#region Private properties ------------------------------------------------
  private readonly handlerService: IHandlerService;
  private readonly loggerService: ILoggerService;
  private pingInterval: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.HandlerService) handlerService: IHandlerService,
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService) {
    loggerService.info('Server' ,`SocketService constructor`);
    this.loggerService = loggerService;
    this.handlerService = handlerService;
    this.pingInterval = 0;
  }
  //#endregion

  //#region Interface members -------------------------------------------------
  public initializeService(expressWs: expressWs.Instance): void {
    const router = Router();
    const wss = expressWs.getWss();
    wss.on('connection', (ws, req) => {
      const newParticipant = this.handlerService.handleConnect(ws);
      this.loggerService.info('Socket', `connection from client '${req.headers['sec-websocket-key'] || 'unknown'}' registered as '${newParticipant.nick}'`);
      ws.on('close', (_number: number, _reason: Buffer) => {

        this.handlerService.handleClose(ws);
      });
    });

    router.ws(
      '/:team',
      (ws, req, _next) => {
        ws.on('message', (msg: string) => {
          try {
            const message: AClientMessage = JSON.parse(msg);
            this.loggerService.info('Socket', `/${req.params.team} <= ${message.type} - ${JSON.stringify(message)}`);
            this.handlerService.handleMessage(message, req.params.team, ws);
          } catch (error) {
            this.handlerService.handleError(ws, error as Error);
          }
        });
      });

    if (this.pingInterval > 0) {
      setInterval(() => { this.handlerService.handlePing() }, this.pingInterval);
    }
    expressWs.app.use('/game', router);
  }
  //#endregion

}
