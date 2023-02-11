import * as expressWs from 'express-ws';

export interface IRouteService {
  setRoutes(expressWS: expressWs.Instance): void;
}