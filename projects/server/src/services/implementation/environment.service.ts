import { injectable } from 'inversify';

import { IEnvironmentService } from '../interfaces';

@injectable()
export class EnvironmentService implements IEnvironmentService {

  //#region public properties -------------------------------------------------
  public readonly environment: string;
  public readonly logLevel: string;
  public readonly portNumber: number;
  //#endregion

  //#region public getters ----------------------------------------------------
  public get isCi(): boolean {
    return process.env.JEST_WORKER_ID ? true : false
  }

  public get isDevelopment(): boolean {
    return this.environment === 'development';
  }

  public get isProduction(): boolean {
    return this.environment === 'production';
  }

  public get isTest(): boolean {
    return this.environment === 'test' || this.environment === 'integration';
  }

  public get systemPath(): string {
    return `/${process.env.SYSTEMPATH || "82b52f20-24e6-44c0-a87d-701c150858a0"}`;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.environment = process.env.ENVIRONMENT?.toLowerCase().trim() || 'development';
    this.portNumber = Number.parseInt(process.env.PORT || '3000');
    this.logLevel = process.env.LOGLEVEL?.toLocaleLowerCase().trim() || (this.isProduction ? 'error' : 'info');
  }
  //#endregion
}