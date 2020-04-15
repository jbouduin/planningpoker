import { Application, Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

import CONTROLLERTYPES from '../controllers/controller.types';

import { IHomeController } from 'controllers';


export interface IRouteService {
  setRoutes(app: Application): void;
}

@injectable()
export class RouteService implements IRouteService {

  // constructor
  public constructor(
    @inject(CONTROLLERTYPES.HomeController) private homeController: IHomeController
  ) { }

  public setRoutes(app: Application): void {
    const router = Router() as expressWs.Router;

    router.ws(
      '/play',
      (ws, req) => {
        ws.on('message', (msg: String) => {
          ws.send(msg);
        });
    });

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

    app.use('/', router);
  }
}
