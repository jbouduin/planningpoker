import type { IEnvironmentService } from './environment.service.js';
import type { ILoggerService } from './logger.service.js';

export interface ICronService {
  /**
   * Calling SetInterval for
   * - cleaning up teams in the storage which have been idle for too long
   * - pinging connected participants
   * @param environmentService - provides the settings for ICronService
   * @param loggerService - the logger service
   */
  initialize(environmentService: IEnvironmentService, loggerService: ILoggerService): void;
}
