import { inject, injectable } from 'inversify';

import SERVICETYPES from '../service.types';

import { ICronService, IEnvironmentService, IHandlerService, ILoggerService } from "../interfaces";
import { setInterval } from 'timers';

@injectable()
export class CronService implements ICronService {

  //#region Private properties ------------------------------------------------
  private readonly environmentService: IEnvironmentService;
  private readonly handlerService: IHandlerService;
  private readonly loggerService: ILoggerService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.EnvironmentService) environmentService: IEnvironmentService,
    @inject(SERVICETYPES.HandlerService) handlerService: IHandlerService,
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService) {
    this.environmentService = environmentService;
    this.loggerService = loggerService;
    this.handlerService = handlerService;
  }
  //#endregion

  //#region ICronService methods ----------------------------------------------
  public initialize(): void {
    this.loggerService.info('Server', `Setting team idle-time to ${this.environmentService.teamIdleTime / 1000} seconds`)

    setInterval(
      () => {
        this.handlerService.handleCronTick(this.environmentService.teamIdleTime);
      },
      60000
    );
  }
  //#endregion
}