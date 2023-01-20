import { Response } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IGameService } from 'services';
import SERVICETYPES from '../services/service.types';

export interface ISystemController {
  CheckTeam(name: string, response: Response): void;
  Delete(response: Response): void;
  Get(response: Response): void;
}

@injectable()
export class SystemController implements ISystemController {

  //#region Private properties ------------------------------------------------
  private gameService: IGameService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.GameService) gameService: IGameService) {
    this.gameService = gameService;
  }
  //#endregion

  //#region ISystemController methods -----------------------------------------
  public CheckTeam(name: string, response: Response): void {
    console.log(`requested existence of ${name}`);
    if (this.gameService.teamExists(name)) {
      response.sendStatus(200);
    } else {
      response.sendStatus(404);
    }
  }

  public Delete(response: Response): void {
    try {
      this.gameService.reset();
      response.sendStatus(200);
    } catch (error) {
      response.status(500).send();
    }
  }

  public Get(response: Response): void {
    response
      .type('application/json')
      .send(this.gameService.serialize());
  }
  //#endregion
}
