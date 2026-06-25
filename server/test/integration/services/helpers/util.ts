import { Container } from 'inversify';
import { It, Mock } from 'moq.ts';
import {
  CardDto,
  CardSetDto,
  ECardSetType,
  EClientMessageType,
  ERole,
  EServerMessageType,
  ICreateMessage,
  IJoinMessage,
  IPauseMessage
} from 'shared-lib';
import {
  CronService,
  EnvironmentService,
  HandlerService,
  MessageService,
  PreflightService,
  SenderService
} from '../../../../src/services/implementation';
import {
  ICronService,
  IEnvironmentService,
  IHandlerService,
  ILoggerService,
  IMessageService,
  IPreflightService,
  ISenderService,
  LogType
} from '../../../../src/services/interfaces';
import SERVICETYPES from '../../../../src/services/service.types';
import {
  CardSetRepository,
  EstimationRepository,
  FactoryService,
  MembershipRepository,
  ServerParticipantRepository,
  StorageService,
  TeamRepository
} from '../../../../src/storage/implementation';
import {
  ICardSetRepository,
  IEstimationRepository,
  IFactoryService,
  IMembershipRepository,
  IServerParticipantRepository,
  IStorageService,
  ITeamRepository
} from '../../../../src/storage/interfaces';
import STORAGETYPES from '../../../../src/storage/storage.types';
import { ITestParticipant, TestParticipant } from './TestParticipant';
import { ITestScrumMaster } from './TestScrumMaster';
import { UnaffectedTeam } from './UnaffectedTeam';

export class Util {
  public static scrumMaster1Nick = 'John Doe';
  public static scrumMaster2Nick = 'Jane Doe';
  public static participant1Nick = 'Max Mustermann';
  public static participant2Nick = 'Erika Mustermann';
  public static participant3Nick = 'Jan Kowalski';
  public static participant4Nick = 'Janina Kowalska';
  public static observer1Name = '张三';
  public static observer2Name = '李四';
  public static team1Name = 'team1';
  public static team2Name = 'team2';
  public static nonExistingTeam = '假想组';
  public static unknownParticipantId = 'unknown participant id';

  public static createMessageTypesExpected = [
    EServerMessageType.Init,
    EServerMessageType.Self,
    EServerMessageType.TeamName,
    EServerMessageType.CardSet,
    EServerMessageType.MemberList,
    EServerMessageType.EstimationList
  ];

  public static joinMessageTypesExpected = [
    EServerMessageType.Init,
    EServerMessageType.Self,
    EServerMessageType.TeamName,
    EServerMessageType.CardSet,
    EServerMessageType.MemberList,
    EServerMessageType.EstimationList
  ];

  public static getContainer(): Container {
    const logMock = new Mock<ILoggerService>()
      .setup((service: ILoggerService) => service.debug(<LogType>It.IsAny(), <string>It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.info(<LogType>It.IsAny(), <string>It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.warning(<LogType>It.IsAny(), <string>It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.error(<LogType>It.IsAny(), <string>It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.logError(<LogType>It.IsAny(), <Error>It.IsAny()))
      .returns(undefined);

    const container = new Container();
    container.bind<ICronService>(SERVICETYPES.CronService).to(CronService).inSingletonScope();
    container.bind<IEnvironmentService>(SERVICETYPES.EnvironmentService).to(EnvironmentService).inSingletonScope();
    container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
    container.bind<ILoggerService>(SERVICETYPES.LoggerService).toConstantValue(logMock.object());
    container.bind<IMessageService>(SERVICETYPES.MessageService).to(MessageService);
    container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
    container.bind<ISenderService>(SERVICETYPES.SenderService).to(SenderService);
    container.bind<ICardSetRepository>(STORAGETYPES.CardSetRepository).to(CardSetRepository).inSingletonScope();
    container
      .bind<IEstimationRepository>(STORAGETYPES.EstimationRepository)
      .to(EstimationRepository)
      .inSingletonScope();
    container.bind<IFactoryService>(STORAGETYPES.FactoryService).to(FactoryService);
    container
      .bind<IMembershipRepository>(STORAGETYPES.MembershipRepository)
      .to(MembershipRepository)
      .inSingletonScope();
    container
      .bind<IServerParticipantRepository>(STORAGETYPES.ServerParticipantRepository)
      .to(ServerParticipantRepository)
      .inSingletonScope();
    container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
    container.bind<ITeamRepository>(STORAGETYPES.TeamRepository).to(TeamRepository).inSingletonScope();
    return container;
  }

  public static connectParticipant(handlerService: IHandlerService, role = ERole.Developer): ITestParticipant {
    return new TestParticipant(handlerService, role);
  }

  public static joinTeam(
    handlerService: IHandlerService,
    teamName: string,
    nickName: string,
    observer = false
  ): ITestParticipant {
    const participant = this.connectParticipant(handlerService);
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: nickName,
        observer: observer
      }
    };
    participant.sendMessage(message, teamName);
    return participant;
  }

  public static joinTeamAndDisconnect(
    handlerService: IHandlerService,
    teamName: string,
    nickName: string,
    observer = false
  ): ITestParticipant {
    const participant = this.joinTeam(handlerService, teamName, nickName, observer);
    participant.closeSocket();
    return participant;
  }

  public static joinTeamAndPause(
    handlerService: IHandlerService,
    teamName: string,
    nickName: string,
    observer = false
  ): ITestParticipant {
    const participant = this.joinTeam(handlerService, teamName, nickName, observer);
    const message: IPauseMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Pause,
      data: undefined
    };
    participant.sendMessage(message);
    participant.closeSocket();
    return participant;
  }

  public static createTeam(
    handlerService: IHandlerService,
    teamName: string,
    scrumMasterNick: string,
    observer = false,
    cardSet?: ECardSetType,
    cards?: CardSetDto
  ): ITestScrumMaster {
    const scrumMaster = this.connectParticipant(handlerService);
    const message: ICreateMessage = {
      type: EClientMessageType.Create,
      senderId: scrumMaster.participantId,
      data: {
        nick: scrumMasterNick,
        observer: observer,
        cardSet: cardSet || ECardSetType.Cohn,
        cards: cards
      }
    };
    scrumMaster.sendMessage(message, teamName);
    return scrumMaster;
  }

  public static createUnaffectedTeam(handlerService: IHandlerService): UnaffectedTeam {
    const teamName = 'Unaffected Team';
    const scrumMaster = this.createTeam(handlerService, teamName, 'Unaffected Scrum Master', false, ECardSetType.Cohn);
    const participant = this.joinTeam(handlerService, teamName, 'Unaffected Participant');
    return new UnaffectedTeam(scrumMaster, participant, teamName);
  }

  public static unknownEstimationIndex(cardSet: ECardSetType): number {
    return (
      this.getContainer()
        .get<IFactoryService>(STORAGETYPES.FactoryService)
        .createCardSet(cardSet)
        .cards.find((card: CardDto) => card.isUnknownEstimation)?.index || -1
    );
  }
}
