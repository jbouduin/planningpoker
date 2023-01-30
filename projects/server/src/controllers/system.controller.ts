import { Response } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IGameService } from '../services';
import SERVICETYPES from '../services/service.types';

export interface ISystemController {
  CheckTeam(name: string, response: Response): void;
  DisconnectParticipant(uuid: string, response: Response): void;
  ResetServer(response: Response): void;
  GetTeam(teamName: string, response: Response): void;
  GetAllTeams(response: Response): void;
  GetParticipants(response: Response): void;
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

  public DisconnectParticipant(uuid: string, response: Response) {
    response.sendStatus(this.gameService.disconnectParticipant(uuid)); // eslint-disable-line
  }

  public ResetServer(response: Response): void {
    try {
      response
        .type('application/json')
        .send(this.gameService.reset());
    } catch (error) {
      response.sendStatus(500);
    }
  }

  public GetTeam(teamName: string, response: Response): void {
    response
      .type('application/json')
      .send(this.gameService.serializeTeam(teamName));
  }

  public GetAllTeams(response: Response): void {
    response
      .type('application/json')
      .send(this.gameService.serializeAllTeams());
  }

  public GetParticipants(response: Response): void {
    response
      .type('application/json')
      .send(this.gameService.serializeParticipants());
  }
  //#endregion
}
