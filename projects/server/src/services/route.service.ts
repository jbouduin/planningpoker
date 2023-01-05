import { Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

import CONTROLLERTYPES from '../controllers/controller.types';

import { IHomeController } from 'controllers';

export interface IRouteService {
  setRoutes(expressWS: expressWs.Instance): void;
}

@injectable()
export class RouteService implements IRouteService {

  // constructor
  public constructor(
    @inject(CONTROLLERTYPES.HomeController) private homeController: IHomeController) {
  }

  public setRoutes(expressWs: expressWs.Instance): void {
    const router = Router();

    router.all(
      '/hello',
      (_request: Request, response: Response) => {
        this.homeController.HelloWorld(_request, response);
      });

    router.all(
      '*',
      (_request: Request, response: Response) => {
        response.sendStatus(404);
      });

    expressWs.app.use('/', router);
  }
}
