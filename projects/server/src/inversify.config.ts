import { Container } from 'inversify';

import CONTROLLERTYPES from './controllers/controller.types';
import SERVICETYPES from './services/service.types';

import { IHomeController, HomeController } from './controllers';
import { ICardService, CardService } from './services';
import { IGameService, GameService } from './services';
import { IRouteService, RouteService } from './services';

const container = new Container();

// controllers
container.bind<IHomeController>(CONTROLLERTYPES.HomeController).to(HomeController);

// services
container.bind<ICardService>(SERVICETYPES.CardService).to(CardService);
container.bind<IGameService>(SERVICETYPES.GameService).to(GameService).inSingletonScope();
container.bind<IRouteService>(SERVICETYPES.RouteService).to(RouteService);

export default container;
