import { Container } from 'inversify';
import CONTROLLERTYPES from './controllers/controller.types.js';
import { ApiController, SystemController } from './controllers/implementation/index.js';
import type { IApiController, ISystemController } from './controllers/interfaces/index.js';
import {
  CronService,
  EnvironmentService,
  HandlerService,
  LoggerService,
  MessageService,
  PreflightService,
  RouteService,
  SenderService,
  SerializationService,
  SocketService
} from './services/implementation/index.js';
import type {
  ICronService,
  IEnvironmentService,
  IHandlerService,
  ILoggerService,
  IMessageService,
  IPreflightService,
  IRouteService,
  ISenderService,
  ISerializationService,
  ISocketService
} from './services/interfaces/index.js';
import SERVICETYPES from './services/service.types.js';
import {
  CardSetRepository,
  EstimationRepository,
  FactoryService,
  MembershipRepository,
  ServerParticipantRepository,
  StorageService,
  TeamRepository
} from './storage/implementation/index.js';
import type {
  ICardSetRepository,
  IEstimationRepository,
  IFactoryService,
  IMembershipRepository,
  IServerParticipantRepository,
  IStorageService,
  ITeamRepository
} from './storage/interfaces/index.js';
import STORAGETYPES from './storage/storage.types.js';

const container = new Container();

//#region controllers ---------------------------------------------------------
container.bind<IApiController>(CONTROLLERTYPES.ApiController).to(ApiController);
container.bind<ISystemController>(CONTROLLERTYPES.SystemController).to(SystemController);
//#endregion

//#region services ------------------------------------------------------------
container.bind<ICronService>(SERVICETYPES.CronService).to(CronService).inSingletonScope();
container.bind<IEnvironmentService>(SERVICETYPES.EnvironmentService).to(EnvironmentService).inSingletonScope();
container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
container.bind<ILoggerService>(SERVICETYPES.LoggerService).to(LoggerService).inSingletonScope();
container.bind<IMessageService>(SERVICETYPES.MessageService).to(MessageService);
container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
container.bind<IRouteService>(SERVICETYPES.RouteService).to(RouteService);
container.bind<ISenderService>(SERVICETYPES.SenderService).to(SenderService);
container.bind<ISerializationService>(SERVICETYPES.SerializationService).to(SerializationService);
container.bind<ISocketService>(SERVICETYPES.SocketService).to(SocketService).inSingletonScope();
//#endregion

//#region storage -------------------------------------------------------------
container.bind<ICardSetRepository>(STORAGETYPES.CardSetRepository).to(CardSetRepository).inSingletonScope();
container.bind<IEstimationRepository>(STORAGETYPES.EstimationRepository).to(EstimationRepository);
container.bind<IFactoryService>(STORAGETYPES.FactoryService).to(FactoryService).inSingletonScope();
container.bind<IMembershipRepository>(STORAGETYPES.MembershipRepository).to(MembershipRepository).inSingletonScope();
container
  .bind<IServerParticipantRepository>(STORAGETYPES.ServerParticipantRepository)
  .to(ServerParticipantRepository)
  .inSingletonScope();
container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
container.bind<ITeamRepository>(STORAGETYPES.TeamRepository).to(TeamRepository).inSingletonScope();
//#endregion

export default container;
