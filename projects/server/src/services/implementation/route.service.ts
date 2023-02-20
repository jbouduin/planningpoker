import { Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import { env } from 'process';
import 'reflect-metadata';

import CONTROLLERTYPES from '../../controllers/controller.types';

import { IApiController, ISystemController } from '../../controllers/interfaces';
import { IRouteService } from '../interfaces';

@injectable()
export class RouteService implements IRouteService {

  //#region private properties ------------------------------------------------
  private readonly apiController: IApiController
  private readonly systemController: ISystemController;
  //#endregion

  //#region private getters ---------------------------------------------------
  private get systemPath(): string {
    return `/${env.SYSTEMPATH || "82b52f20-24e6-44c0-a87d-701c150858a0"}`;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(CONTROLLERTYPES.ApiController) apiController: IApiController,
    @inject(CONTROLLERTYPES.SystemController) systemController: ISystemController) {
    this.apiController = apiController;
    this.systemController = systemController;
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
