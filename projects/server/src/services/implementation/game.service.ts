import { Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import SERVICETYPES from '../service.types';

import { ClientMessage, EParticipantStatus, EPokerStatus, ERole } from '../../../../shared-lib/lib';
import { IGameService, IHandlerService } from '../interfaces';

interface ITeamDump {
  team: string;
  status: EPokerStatus;
  members: Array<IParticipantDump>;
}

interface IParticipantDump {
  name: string;
  role: ERole;
  status: EParticipantStatus;
  observer: boolean;
  uuid: string;
}

interface IGameServiceDump {
  teams: Array<ITeamDump>;
}

@injectable()
export class GameService implements IGameService {

  //#region Private properties ------------------------------------------------
  private readonly handlerService: IHandlerService;
  private pingInterval: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.HandlerService) handlerService: IHandlerService) {
    console.log(`${new Date().toISOString()}: gameservice constructor`);
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
      console.log(`${new Date().toISOString()}: connection from client '${req.headers['sec-websocket-key'] || 'unknown'}' registered as '${newParticipant.nick}'`);
      ws.on('close', (_number: number, _reason: Buffer) => {
        this.handlerService.handleClose(ws);
      });
    });

    router.ws(
      '/:team',
      (ws, req, _next) => {
        ws.on('message', (msg: string) => {
          try {
            const message: ClientMessage = JSON.parse(msg);
            console.log(`${new Date().toISOString()}: <= ${message.type}: ${message}`);
            this.handlerService.handleMessage(message, req.params.team, ws);
          } catch (err) {
            this.handlerService.handleError(ws, err);
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
