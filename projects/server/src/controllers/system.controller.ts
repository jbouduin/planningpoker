import { Response } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IGameService } from 'services';
import SERVICETYPES from '../services/service.types';

export interface ISystemController {
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
  Delete(response: Response): void {
    response.status(500).send();
  }

  Get(response: Response): void {
    response.status(500).send();
  }
  //#endregion
}
