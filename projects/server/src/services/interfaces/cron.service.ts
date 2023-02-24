import { IEnvironmentService } from "./environment.service";
import { ILoggerService } from "./logger.service";

export interface ICronService {
  initialize(environmentService: IEnvironmentService, loggerService: ILoggerService): void;
}