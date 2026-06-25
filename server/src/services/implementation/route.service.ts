import { Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import CONTROLLERTYPES from '../../controllers/controller.types.js';
import type { IApiController, ISystemController } from '../../controllers/interfaces/index.js';
import type { IEnvironmentService, ILoggerService, IRouteService } from '../interfaces/index.js';
import SERVICETYPES from '../service.types.js';

@injectable()
export class RouteService implements IRouteService {
  //#region private properties ------------------------------------------------
  private readonly apiController: IApiController;
  private readonly loggerService: ILoggerService;
  private readonly systemController: ISystemController;
  private readonly systemPath: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(CONTROLLERTYPES.ApiController) apiController: IApiController,
    @inject(SERVICETYPES.EnvironmentService) environmentService: IEnvironmentService,
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService,
    @inject(CONTROLLERTYPES.SystemController) systemController: ISystemController
  ) {
    this.apiController = apiController;
    this.loggerService = loggerService;
    this.systemController = systemController;
    this.systemPath = environmentService.systemPath;
  }
  //#endregion

  //#region IRouteService methods ---------------------------------------------
  public setRoutes(expressWs: expressWs.Instance): void {
    const router = Router();
    this.setSystemRoutes(router);
    this.setApiRoutes(router);
    // Fallback
    router.use((_request: Request, response: Response) => {
      response.sendStatus(404);
    });

    expressWs.app.use('/', router);
  }
  //#endregion

  //#region system routes -----------------------------------------------------
  private setSystemRoutes(router: Router): void {
    router.post(`${this.systemPath}/reset`, (_request: Request, response: Response) => {
      try {
        response.type('application/json').send(this.systemController.resetServer());
      } catch (error) {
        this.loggerService.logError('Server', error as Error);
        response.sendStatus(500);
      }
    });

    router.get(`${this.systemPath}/team`, (_request: Request, response: Response) => {
      try {
        response.type('application/json').send(this.systemController.getAllTeams());
      } catch (error) {
        this.loggerService.logError('Server', error as Error);
        response.sendStatus(500);
      }
    });

    router.get(`${this.systemPath}/team/:name`, (request: Request<{ name: string }>, response: Response) => {
      try {
        response.type('application/json').send(this.systemController.getTeam(request.params.name));
      } catch (error) {
        this.loggerService.logError('Server', error as Error);
        response.sendStatus(500);
      }
    });

    router.delete(`${this.systemPath}/team/:name`, (request: Request<{ name: string }>, response: Response) => {
      try {
        response.type('application/json').send(this.systemController.deleteTeam(request.params.name));
      } catch (error) {
        this.loggerService.logError('Server', error as Error);
        response.sendStatus(500);
      }
    });

    router.get(`${this.systemPath}/participant`, (_request: Request, response: Response) => {
      try {
        response.type('application/json').send(this.systemController.getParticipants());
      } catch (error) {
        this.loggerService.logError('Server', error as Error);
        response.sendStatus(500);
      }
    });

    router.post(
      `${this.systemPath}/participant/:participantId/disconnect`,
      (request: Request<{ participantId: string }>, response: Response) => {
        try {
          response
            .type('application/json')
            .send(this.systemController.disconnectParticipant(request.params.participantId));
        } catch (error) {
          this.loggerService.logError('Server', error as Error);
          response.sendStatus(500);
        }
      }
    );
  }

  private setApiRoutes(router: Router): void {
    router.get(
      '/api/team/:name/participant/:participantId',
      (request: Request<{ name: string; participantId: string }>, response: Response) => {
        try {
          response
            .type('application/json')
            .send(JSON.stringify(this.apiController.canRejoin(request.params.name, request.params.participantId)));
        } catch (error) {
          this.loggerService.logError('Server', error as Error);
          response.sendStatus(500);
        }
      }
    );

    router.get('/api/cardsets', (_request: Request, response: Response) => {
      try {
        response.type('application/json').send(JSON.stringify(this.apiController.availableCardSets()));
      } catch (error) {
        this.loggerService.logError('Server', error as Error);
        response.sendStatus(500);
      }
    });
  }
  //#endregion
}
