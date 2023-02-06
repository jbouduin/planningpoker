import * as expressWs from 'express-ws';

export interface IGameService {
  initializeService(expressWS: expressWs.Instance): void;
}