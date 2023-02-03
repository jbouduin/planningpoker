import { Container } from 'inversify';

import CONTROLLERTYPES from '../controllers/controller.types';
import SERVICETYPES from './service.types';

import { FactoryService, IFactoryService } from '.';
import { ISystemController, SystemController } from '../controllers';
import { CardService, GameService, RouteService } from './implementation';
import { ICardService, IGameService, IRouteService } from './interfaces';


const container = new Container();

// controllers
container.bind<ISystemController>(CONTROLLERTYPES.SystemController).to(SystemController);

// services
container.bind<IFactoryService>(SERVICETYPES.FactoryService).to(FactoryService);
container.bind<ICardService>(SERVICETYPES.CardService).to(CardService);
container.bind<IGameService>(SERVICETYPES.GameService).to(GameService).inSingletonScope();
container.bind<IRouteService>(SERVICETYPES.RouteService).to(RouteService);

export default container;
