import * as expressWs from 'express-ws';

export interface ISocketService {
  initializeService(expressWS: expressWs.Instance): void;
}