import { Container } from "inversify";
import { It, Mock } from 'moq.ts';

import { ECardSet, EClientMessageType, ICardSet, ICreatemessage, IJoinMessage, IPauseMessage } from '../../../../../shared-lib/src';

import SERVICETYPES from '../../../../src/services/service.types';
import STORAGETYPES from '../../../../src/storage/storage.types';

import { CardService, CronService, EnvironmentService, HandlerService, MessageService, PreflightService, SenderService } from '../../../../src/services/implementation';
import { ICardService, ICronService, IEnvironmentService, IHandlerService, ILoggerService, IMessageService, IPreflightService, ISenderService, LogType } from '../../../../src/services/interfaces';
import { CardSetRepository, EstimationRepository, MembershipRepository, ServerParticipantRepository, StorageService, TeamRepository } from "../../../../src/storage/implementation";
import { ICardSetRepository, IEstimationRepository, IMembershipRepository, IServerParticipantRepository, IStorageService, ITeamRepository } from "../../../../src/storage/interfaces";
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
    container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
    container.bind<ICronService>(SERVICETYPES.CronService).to(CronService).inSingletonScope();
    container.bind<IEnvironmentService>(SERVICETYPES.EnvironmentService).to(EnvironmentService).inSingletonScope();
    container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
    container.bind<ILoggerService>(SERVICETYPES.LoggerService).toConstantValue(logMock.object());
    container.bind<IMessageService>(SERVICETYPES.MessageService).to(MessageService);
    container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
    container.bind<ISenderService>(SERVICETYPES.SenderService).to(SenderService);
    container.bind<ICardSetRepository>(STORAGETYPES.CardSetRepository).to(CardSetRepository).inSingletonScope();
    container.bind<IEstimationRepository>(STORAGETYPES.EstimationRepository).to(EstimationRepository).inSingletonScope();
    container.bind<IMembershipRepository>(STORAGETYPES.MembershipRepository).to(MembershipRepository).inSingletonScope();
    container.bind<IServerParticipantRepository>(STORAGETYPES.ServerParticipantRepository).to(ServerParticipantRepository).inSingletonScope();
    container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
    container.bind<ITeamRepository>(STORAGETYPES.TeamRepository).to(TeamRepository).inSingletonScope();
    return container;
  }

  public static connectParticipant(handlerService: IHandlerService): ITestParticipant {
    return new TestParticipant(handlerService);
  }

  public static joinTeam(handlerService: IHandlerService, teamName: string, nickName: string, observer = false): ITestParticipant {
    const participant = this.connectParticipant(handlerService);
    participant.teamName = teamName;
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: nickName,
        observer: observer
      }
    };
    participant.sendMessage(message);
    return participant;
  }

  public static joinTeamAndDisconnect(handlerService: IHandlerService, teamName: string, nickName: string, observer = false): ITestParticipant {
    const participant = this.joinTeam(handlerService, teamName, nickName, observer);
    participant.closeSocket();
    return participant;
  }

  public static joinTeamAndPause(handlerService: IHandlerService, teamName: string, nickName: string, observer = false): ITestParticipant {
    const participant = this.joinTeam(handlerService, teamName, nickName, observer);
    const message: IPauseMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Pause,
      data: undefined
    }
    participant.sendMessage(message);
    participant.closeSocket();
    return participant;
  }

  public static createTeam(
    handlerService: IHandlerService,
    teamName: string,
    scrumMasterNick: string,
    observer = false,
    cardSet?: ECardSet,
    cards?: ICardSet): ITestScrumMaster {
    const scrumMaster = this.connectParticipant(handlerService);
    scrumMaster.teamName = teamName;
    const message: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: scrumMaster.participantId,
      data: {
        nick: scrumMasterNick,
        observer: observer,
        cardSet: cardSet || ECardSet.Cohn,
        cards: cards
      }
    }
    scrumMaster.sendMessage(message);
    return scrumMaster;
  }

  public static createUnaffectedTeam(handlerService: IHandlerService): UnaffectedTeam {
    const teamName = 'Unaffected Team';
    const scrumMaster = this.createTeam(handlerService, teamName, 'Unaffected Scrum Master', false, ECardSet.Cohn);
    const participant = this.joinTeam(handlerService, teamName, 'Unaffected Participant');
    return new UnaffectedTeam(scrumMaster, participant, teamName);
  }

}