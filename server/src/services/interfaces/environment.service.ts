export interface IEnvironmentService {
  /**
   * The environment currently running. Read from process.env.ENVIRONMENT
   * @readonly
   * @defaultValue "development"
   */
  readonly environment: string;

  /**
   * @readonly
   * @returns true if running in development
   */
  readonly isDevelopment: boolean;

  /**
   * @readonly
   * @returns true if running in production
   */
  readonly isProduction: boolean;

  /**
   * @readonly
   * @returns true if running in test
   */
  readonly isTest: boolean;

  /**
   * The loglevel. Read from process.env.LOGLEVEL
   * @readonly
   * @defaultValue 'error' in production, 'info' in other environments
   */
  readonly logLevel: string;

  /**
   * The interval to ping connected sockets in milliseconds. Read from process.env.PING_INTERVAL
   * @readonly
   * @defaultValue 0 (no ping messages are sent)
   */
  readonly pingInterval: number;

  /**
   * The system path that allows performing http requests. Read from process.env.SYSTEMPATH
   * @readonly
   * @defaultValue "82b52f20-24e6-44c0-a87d-701c150858a0"
   */
  readonly systemPath: string;

  /**
   * The maximum idle time of a team in milliseconds before the cronservice removes the team.
   * Read from process.env.TEAM_IDLE_TIME
   * @readonly
   * @defaultValue 1 Hour
   */
  readonly teamIdleTime: number;
}