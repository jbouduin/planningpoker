import { Container } from 'inversify';

import CONTROLLERTYPES from './controllers/controller.types';
import SERVICETYPES from './services/service.types';
import STORAGETYPES from './storage/storage.types';

import { ApiController, SystemController } from './controllers/implementation';
import { IApiController, ISystemController } from './controllers/interfaces';
import { CardService, CronService, EnvironmentService, HandlerService, LoggerService, MessageService, PreflightService, RouteService, SenderService, SocketService } from './services/implementation';
import { ICardService, ICronService, IEnvironmentService, IHandlerService, ILoggerService, IMessageService, IPreflightService, IRouteService, ISenderService, ISocketService } from './services/interfaces';
import { CardSetRepository, EstimationRepository, MembershipRepository, ParticipantRepository, StorageService, TeamRepository } from './storage/implementation';
import { ICardSetRepository, IEstimationRepository, IMembershipRepository, IParticipantRepository, IStorageService, ITeamRepository } from './storage/interfaces';

const container = new Container();

//#region controllers ---------------------------------------------------------
container.bind<IApiController>(CONTROLLERTYPES.ApiController).to(ApiController);
container.bind<ISystemController>(CONTROLLERTYPES.SystemController).to(SystemController);
//#endregion

//#region services ------------------------------------------------------------
container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
container.bind<ICronService>(SERVICETYPES.CronService).to(CronService).inSingletonScope();
container.bind<IEnvironmentService>(SERVICETYPES.EnvironmentService).to(EnvironmentService).inSingletonScope();
container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
container.bind<ILoggerService>(SERVICETYPES.LoggerService).to(LoggerService).inSingletonScope();
container.bind<IMessageService>(SERVICETYPES.MessageService).to(MessageService);
container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
container.bind<IRouteService>(SERVICETYPES.RouteService).to(RouteService);
container.bind<ISenderService>(SERVICETYPES.SenderService).to(SenderService);
container.bind<ISocketService>(SERVICETYPES.SocketService).to(SocketService).inSingletonScope();
//#endregion

//#region storage -------------------------------------------------------------
container.bind<ICardSetRepository>(STORAGETYPES.CardSetRepository).to(CardSetRepository).inSingletonScope();
container.bind<IEstimationRepository>(STORAGETYPES.EstimationRepository).to(EstimationRepository).inSingletonScope();
container.bind<IMembershipRepository>(STORAGETYPES.MembershipRepository).to(MembershipRepository).inSingletonScope();
container.bind<IParticipantRepository>(STORAGETYPES.ParticipantRepository).to(ParticipantRepository).inSingletonScope();
container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
container.bind<ITeamRepository>(STORAGETYPES.TeamRepository).to(TeamRepository).inSingletonScope();
//#endregion

export default container;
