import cors from 'cors';
import express from 'express';
import expressWs from 'express-ws';
import { logger } from 'express-winston';

import container from './inversify.config';
import { ICronService, IEnvironmentService, ILoggerService, IRouteService, ISocketService } from './services/interfaces';
import SERVICETYPES from './services/service.types';

class App {

  public expressWS: expressWs.Instance;

  public constructor() {
    const loggerService = container.get<ILoggerService>(SERVICETYPES.LoggerService);
    const app = express();
    app.use(logger({
      transports: loggerService.transports,
      format: loggerService.getDefaultLogFormat('Express'),
      meta: false,
      msg: 'HTTP {{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms',
      colorize: false
    }))
    this.expressWS = expressWs(app);

    container.get<ISocketService>(SERVICETYPES.SocketService).initializeService(this.expressWS);
    container.get<IRouteService>(SERVICETYPES.RouteService).setRoutes(this.expressWS);
    container.get<ICronService>(SERVICETYPES.CronService).initialize(
      container.get<IEnvironmentService>(SERVICETYPES.EnvironmentService),
      loggerService);
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
