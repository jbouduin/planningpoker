import { Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

import CONTROLLERTYPES from '../controllers/controller.types';

import { ISystemController } from 'controllers';
import { env } from 'process';

export interface IRouteService {
  setRoutes(expressWS: expressWs.Instance): void;
}

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

    router.delete(
      this.systemPath,
      (_request: Request, response: Response) => {
        this.systemController.Delete(response);
      }
    );

    router.get(
      `${this.systemPath}/team`,
      (_request: Request, response: Response) => {
        this.systemController.GetAllTeams(response);
      }
    );

    router.get(
      `${this.systemPath}/team/:name`,
      (request: Request, response: Response) => {
        const teamName = request.params['name'];
        if (teamName) {
          this.systemController.GetTeam(teamName, response);
        }
        else {
          this.systemController.GetAllTeams(response);
        }
      }
    );

    router.get(
      `${this.systemPath}/participant`,
      (_request: Request, response: Response) => {
        this.systemController.GetParticipants(response);
      }
    );

    router.get(
      '/team/:name',
      (request: Request, response: Response) => {
        const name = request.params.name;
        if (name) {
          this.systemController.CheckTeam(name, response);
        } else {
          response.sendStatus(404);
        }
      });

    router.all(
      '*',
      (_request: Request, response: Response) => {
        console.log(`404: ${_request.url}`);
        response.sendStatus(404);
      });

    expressWs.app.use('/', router);
  }
  //#endregion
}
