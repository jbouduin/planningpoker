import { injectable } from 'inversify';
import type { IEnvironmentService } from '../interfaces/index.js';

@injectable()
export class EnvironmentService implements IEnvironmentService {
  //#region public properties -------------------------------------------------
  public readonly environment: string;
  public readonly logLevel: string;
  public readonly pingInterval: number;
  public readonly portNumber: number;
  public readonly systemPath: string;
  public readonly teamIdleTime: number;
  //#endregion

  //#region public getters ----------------------------------------------------
  public get isDevelopment(): boolean {
    return this.environment === 'development';
  }

  public get isProduction(): boolean {
    return this.environment === 'production';
  }

  public get isTest(): boolean {
    return this.environment === 'test' || this.environment === 'integration';
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.environment = process.env.ENVIRONMENT?.toLowerCase().trim() || 'development';
    this.logLevel = process.env.LOGLEVEL?.toLocaleLowerCase().trim() || (this.isProduction ? 'error' : 'info');
    this.pingInterval = Number.parseInt(process.env.PING_INTERVAL || '0');
    this.portNumber = Number.parseInt(process.env.PORT || '3000');
    this.systemPath = `/api/${process.env.SYSTEMPATH || '82b52f20-24e6-44c0-a87d-701c150858a0'}`;
    this.teamIdleTime = Number.parseInt(process.env.TEAM_IDLE_TIME || '3600000');
  }
  //#endregion
}
