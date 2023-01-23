import * as cors from 'cors';
import * as express from 'express';
import * as expressWs from 'express-ws';
import { IGameService, IRouteService } from './services';
import container from './inversify.config';
import SERVICETYPES from './services/service.types';

class App {

  public expressWS: expressWs.Instance;

  public constructor() {
    this.expressWS = expressWs(express());

    container.get<IGameService>(SERVICETYPES.GameService).initializeTeam(this.expressWS);
    container.get<IRouteService>(SERVICETYPES.RouteService).setRoutes(this.expressWS);

    this.config(this.expressWS.app);
  }

  private config(app: express.Application): void {

    app.use(cors({ origin: '*' }));
    app.use(function (req, res, next) {
      // Website you wish to allow to connect
      res.header('Access-Control-Allow-Origin', '*');
      // Request methods you wish to allow
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      // Request headers you wish to allow
      res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', 'false');
      // Pass to next layer of middleware
      next();
    });

    // support application/json type post data
    app.use(express.json());
    // support application/x-www-form-urlencoded post data
    app.use(express.urlencoded({ extended: false }));
  }

}

export default new App().expressWS.app;
