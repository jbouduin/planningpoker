import { Container } from 'inversify';

import CONTROLLERTYPES from './controllers/controller.types';
import SERVICETYPES from './services/service.types';
import STORAGETYPES from './storage/storage.types';

import { ApiController, SystemController } from './controllers/implementation';
import { IApiController, ISystemController } from './controllers/interfaces';
import { CardService, CronService, SocketService, HandlerService, MessageService, PreflightService, RouteService, SenderService, LoggerService } from './services/implementation';
import { ICardService, ISocketService, IHandlerService, IMessageService, IPreflightService, IRouteService, ISenderService, ICronService, ILoggerService } from './services/interfaces';
import { StorageService } from './storage/implementation';
import { IStorageService } from './storage/interfaces';
import {  } from 'services/implementation/cron.service';

const container = new Container();

//#region controllers ---------------------------------------------------------
container.bind<IApiController>(CONTROLLERTYPES.ApiController).to(ApiController);
container.bind<ISystemController>(CONTROLLERTYPES.SystemController).to(SystemController);
//#endregion

//#region services ------------------------------------------------------------
container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
container.bind<ICronService>(SERVICETYPES.CronService).to(CronService).inSingletonScope();
container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
container.bind<ILoggerService>(SERVICETYPES.LoggerService).to(LoggerService).inSingletonScope();
container.bind<IMessageService>(SERVICETYPES.MessageService).to(MessageService);
container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
container.bind<IRouteService>(SERVICETYPES.RouteService).to(RouteService);
container.bind<ISenderService>(SERVICETYPES.SenderService).to(SenderService);
container.bind<ISocketService>(SERVICETYPES.SocketService).to(SocketService).inSingletonScope();
//#endregion

//#region storage -------------------------------------------------------------
container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
//#endregion

export default container;
