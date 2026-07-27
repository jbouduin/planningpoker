const SERVICETYPES = {
  CronService: Symbol('CronService'),
  EnvironmentService: Symbol('EnvironmentService'),
  HandlerService: Symbol('HandlerService'),
  LoggerService: Symbol('LoggerService,'),
  MessageService: Symbol('MessageService'),
  PreflightService: Symbol('PreflightService'),
  RouteService: Symbol('RouteService'),
  SenderService: Symbol('SenderService'),
  SerializationService: Symbol('SerializationService'),
  SocketService: Symbol('SocketService')
};

export default SERVICETYPES;
