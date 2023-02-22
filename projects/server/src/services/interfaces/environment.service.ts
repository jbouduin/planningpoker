export interface IEnvironmentService {
  readonly environment: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
  readonly logLevel: string;
  readonly systemPath: string;
  readonly teamIdleTime: number;
}