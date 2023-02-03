import { Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

import CONTROLLERTYPES from '../../controllers/controller.types';

import { ISystemController } from '../../controllers';
import { env } from 'process';
import { IRouteService } from '../interfaces';

@injectable()
export class RouteService implements IRouteService {

  //#region private properties ------------------------------------------------
  private systemController: ISystemController;
  //#endregion

  //#region private getters ---------------------------------------------------
  private get systemPath(): string {
    return `/${env.SYSTEMPATH || "82b52f20-24e6-44c0-a87d-701c150858a0"}`;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(CONTROLLERTYPES.SystemController) systemController: ISystemController) {
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
        this.systemController.resetServer(response);
      }
    );

    router.get(
      `${this.systemPath}/team`,
      (_request: Request, response: Response) => {
        this.systemController.getAllTeams(response);
      }
    );

    router.get(
      `${this.systemPath}/team/:name`,
      (request: Request, response: Response) => {
        const teamName = request.params.name;
        if (teamName) {
          this.systemController.getTeam(teamName, response);
        }
        else {
          this.systemController.getAllTeams(response);
        }
      }
    );

    router.get(
      `${this.systemPath}/participant`,
      (_request: Request, response: Response) => {
        this.systemController.getParticipants(response);
      }
    );

    router.post(
      `${this.systemPath}/participant/:uuid/disconnect`,
      (request: Request, response: Response) => {
        this.systemController.disconnectParticipant(request.params.uuid, response);
      }
    );
  }

  private setApiRoutes(router: Router): void {
    router.get(
      '/team/:name/participant/:uuid',
      (request: Request, response: Response) => {
        this.systemController.canRejoin(request.params.name, request.params.uuid, response);
      }
    );
  }
  //#endregion
}
