import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import { AClientMessage } from 'shared-lib';
import type { IHandlerService, ILoggerService, ISocketService } from '../interfaces/index.js';
import SERVICETYPES from '../service.types.js';

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
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService
  ) {
    loggerService.info('Server', 'SocketService constructor');
    this.loggerService = loggerService;
    this.handlerService = handlerService;
    this.pingInterval = 0;
  }
  //#endregion

  //#region Interface members -------------------------------------------------
  public initializeService(expressWs: expressWs.Instance): void {
    // const router = expressWs.app.router;
    const app = expressWs.app;
    const wss = expressWs.getWss();
    wss.on('connection', (ws, req) => {
      const newParticipant = this.handlerService.handleConnect(ws);
      this.loggerService.info(
        'Socket',
        `connection from client '${req.headers['sec-websocket-key'] || 'unknown'}' registered as '${newParticipant.nick}'`
      );
      ws.on('close', (_number: number, _reason: Buffer) => {
        this.handlerService.handleClose(ws);
      });
    });

    app.ws('/ws/game/:team', (ws, req, _next) => {
      const team = req.params.team as string;

      ws.on('message', (msg: string) => {
        try {
          // wwweslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const message: AClientMessage = JSON.parse(msg) as AClientMessage;
          //eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          this.loggerService.info('Socket', `/${req.params.team} <= ${message.type} - ${JSON.stringify(message)}`);
          this.handlerService.handleMessage(message, team, ws);
        } catch (error) {
          this.handlerService.handleError(ws, error as Error);
        }
      });
    });

    // expressWs.app.use('/game', router);
  }
  //#endregion
}
