import { Container } from 'inversify';

import CONTROLLERTYPES from './controllers/controller.types';
import SERVICETYPES from './services/service.types';

import { ISystemController, SystemController } from './controllers';
import { IFactoryService, FactoryService } from './services';
import { ICardService, CardService } from './services';
import { IGameService, GameService } from './services';
import { IRouteService, RouteService } from './services';

const container = new Container();

// controllers
container.bind<ISystemController>(CONTROLLERTYPES.SystemController).to(SystemController);

// services
container.bind<IFactoryService>(SERVICETYPES.FactoryService).to(FactoryService);
container.bind<ICardService>(SERVICETYPES.CardService).to(CardService);
container.bind<IGameService>(SERVICETYPES.GameService).to(GameService).inSingletonScope();
container.bind<IRouteService>(SERVICETYPES.RouteService).to(RouteService);

export default container;
