import { Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import CONTROLLERTYPES from '../../controllers/controller.types';
import SERVICETYPES from '../service.types';

import { IApiController, ISystemController } from '../../controllers/interfaces';
import { IEnvironmentService, IRouteService } from '../interfaces';

@injectable()
export class RouteService implements IRouteService {

  //#region private properties ------------------------------------------------
  private readonly apiController: IApiController
  private readonly systemController: ISystemController;
  private readonly systemPath: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(CONTROLLERTYPES.ApiController) apiController: IApiController,
    @inject(SERVICETYPES.EnvironmentService) environmentService: IEnvironmentService,
    @inject(CONTROLLERTYPES.SystemController) systemController: ISystemController) {
    this.apiController = apiController;
    this.systemController = systemController;
    this.systemPath = environmentService.systemPath;
  }
  //#endregion

  //#region IRouteService methods ---------------------------------------------
  public setRoutes(expressWs: expressWs.Instance): void {
    const router = Router();
    this.setSystemRoutes(router);
    this.setApiRoutes(router);

    // fallback
    router.all(
      '*',
      (_request: Request, response: Response) => {
        console.log(`404: ${_request.url}`);
        response.sendStatus(404);
      });

    expressWs.app.use('/', router);
  }
  //#endregion

  //#region system routes -----------------------------------------------------
  private setSystemRoutes(router: Router): void {
    router.post(
      `${this.systemPath}/reset`,
      (_request: Request, response: Response) => {
        try {
          response
            .type('application/json')
            .send(this.systemController.resetServer());
        } catch (error) {
          console.log(error);
          response.sendStatus(500);
        }
      }
    );

    router.get(
      `${this.systemPath}/team`,
      (_request: Request, response: Response) => {
        try {
          response
            .type('application/json')
            .send(this.systemController.getAllTeams());
        } catch (error) {
          console.log(error);
          response.sendStatus(500);
        }
      }
    );

    router.get(
      `${this.systemPath}/team/:name`,
      (request: Request, response: Response) => {
        try {
          response
            .type('application/json')
            .send(this.systemController.getTeam(request.params.name));
        } catch (error) {
          console.log(error);
          response.sendStatus(500);
        }
      }
    );

    router.get(
      `${this.systemPath}/participant`,
      (_request: Request, response: Response) => {
        try {
          response
            .type('application/json')
            .send(this.systemController.getParticipants());
        } catch (error) {
          console.log(error);
          response.sendStatus(500);
        }
      }
    );

    router.post(
      `${this.systemPath}/participant/:uuid/disconnect`,
      (request: Request, response: Response) => {
        try {
          response
            .type('application/json')
            .send(this.systemController.disconnectParticipant(request.params.uuid));
        } catch (error) {
          console.log(error);
          response.sendStatus(500);
        }
      }
    );
  }

  private setApiRoutes(router: Router): void {
    router.get(
      '/team/:name/participant/:uuid',
      (request: Request, response: Response) => {
        try {
          response
            .type('application/json')
            .send(JSON.stringify(this.apiController.canRejoin(request.params.name, request.params.uuid)));
        } catch (error) {
          console.log(error);
          response.sendStatus(500);
        }
      }
    );

    router.get(
      '/cardsets',
      (_request: Request, response: Response) => {
        try {
          response
            .type('application/json')
            .send(JSON.stringify(this.apiController.availableCardSets()));
        } catch (error) {
          console.log(error);
          response.sendStatus(500);
        }
      }
    )
  }
  //#endregion
}
