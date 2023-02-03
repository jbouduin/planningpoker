import { Response } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IGameService } from '../services';
import SERVICETYPES from '../services/service.types';

export interface ISystemController {
  canRejoin(teamName: string, uuid: string, response: Response): void;
  disconnectParticipant(uuid: string, response: Response): void;
  resetServer(response: Response): void;
  getTeam(teamName: string, response: Response): void;
  getAllTeams(response: Response): void;
  getParticipants(response: Response): void;
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
  public canRejoin(teamName: string, uuid: string, response: Response): void {
    console.log(`check if ${uuid} can rejoin ${teamName}`);
    try {
      response
        .type('application/json')
        .send(this.gameService.canRejoin(teamName, uuid));
    } catch (error) {
      console.log(error);
      response.sendStatus(500);
    }
  }

  public disconnectParticipant(uuid: string, response: Response) {
    try {
      response
        .type('application/json')
        .send(this.gameService.disconnectParticipant(uuid));
    } catch (error) {
      console.log(error);
      response.sendStatus(500);
    }
  }

  public resetServer(response: Response): void {
    try {
      response
        .type('application/json')
        .send(this.gameService.reset());
    } catch (error) {
      console.log(error);
      response.sendStatus(500);
    }
  }

  public getTeam(teamName: string, response: Response): void {
    response
      .type('application/json')
      .send(this.gameService.serializeTeam(teamName));
  }

  public getAllTeams(response: Response): void {
    response
      .type('application/json')
      .send(this.gameService.serializeAllTeams());
  }

  public getParticipants(response: Response): void {
    response
      .type('application/json')
      .send(this.gameService.serializeParticipants());
  }
  //#endregion
}
