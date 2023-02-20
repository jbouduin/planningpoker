import { inject, injectable } from 'inversify';

import SERVICETYPES from '../service.types';

import { ICronService, IHandlerService } from "services/interfaces";
import { setInterval } from 'timers';

@injectable()
export class CronService implements ICronService {

  private readonly handlerService: IHandlerService;

  public constructor(@inject(SERVICETYPES.HandlerService) handlerService: IHandlerService) {
    this.handlerService = handlerService;
  }

  public initialize(interval: number): void {
    console.log(`${new Date().toISOString()}: Setting team idle-time to ${interval / 1000} seconds`);
    setInterval(
      () => {
        this.handlerService.handleCronTick(interval);
      },
      60000
    );
  }
}