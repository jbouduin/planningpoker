export const ENVIRONMENT = {
  /**
   * Environment
   */
  environment: 'development',
  /**
   * Supported languages
   */
  supportedLanguages: ['de-DE', 'en-US'],
  /**
   * Default language
   */
  defaultLanguage: 'en-US',
  /**
   * Websocket host
   */
  webSocketHost: 'ws://localhost:3001',
  /**
   * Websocket path
   */
  webSocketPath: 'ws/game',
  /**
   * API host
   */
  apiHost: '', // Empty because handled by proxy config (would be http://localhost:3001)
  /**
   * API root
   */
  apiRoot: 'api',
  /**
   * Web host
   */
  webHost: 'http://localhost:4002'
};
