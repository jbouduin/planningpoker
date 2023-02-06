import { Container } from 'inversify';

import CONTROLLERTYPES from './controllers/controller.types';
import SERVICETYPES from './services/service.types';
import STORAGETYPES from './storage/storage.types';

import { FactoryService, IFactoryService } from './services';
import { ISystemController } from './controllers/interfaces';
import { SystemController } from './controllers/implementation';
import { CardService, GameService, HandlerService, MessageService, RouteService } from './services/implementation';
import { ICardService, IGameService, IHandlerService, IMessageService, IRouteService, ISenderService } from './services/interfaces';
import { SenderService } from './services/implementation/sender.service';
import { IStorageService } from './storage/interfaces';
import { StorageService } from './storage/implementation';


const container = new Container();

// controllers
container.bind<ISystemController>(CONTROLLERTYPES.SystemController).to(SystemController);

// services
container.bind<IFactoryService>(SERVICETYPES.FactoryService).to(FactoryService);
container.bind<ICardService>(SERVICETYPES.CardService).to(CardService);
container.bind<IGameService>(SERVICETYPES.GameService).to(GameService).inSingletonScope();
container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
container.bind<IMessageService>(SERVICETYPES.MessageService).to(MessageService);
container.bind<IRouteService>(SERVICETYPES.RouteService).to(RouteService);
container.bind<ISenderService>(SERVICETYPES.SenderService).to(SenderService);

// storage
container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();

export default container;
