import { inject, injectable } from 'inversify';

import SERVICETYPES from '../service.types';

import { ICronService, IEnvironmentService, IHandlerService, ILoggerService } from "../interfaces";
import { setInterval } from 'timers';

@injectable()
export class CronService implements ICronService {

  //#region Private properties ------------------------------------------------
  private readonly handlerService: IHandlerService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.HandlerService) handlerService: IHandlerService) {
    this.handlerService = handlerService;
  }
  //#endregion

  //#region ICronService methods ----------------------------------------------
  public initialize(environmentService: IEnvironmentService, loggerService: ILoggerService): void {
    loggerService.info('Server', `Setting team idle-time to ${environmentService.teamIdleTime / 1000} seconds`)

    setInterval(
      () => {
        this.handlerService.handleCronTick(environmentService.teamIdleTime);
      },
      60000
    );
  }
  //#endregion
}