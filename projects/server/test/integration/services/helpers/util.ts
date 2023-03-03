import { jest } from '@jest/globals';
import { InjectionToken, It, Mock } from 'moq.ts';
import { Container } from "inversify";

import SERVICETYPES from '../../../../src/services/service.types';
import STORAGETYPES from '../../../../src/storage/storage.types';

import { AServerMessage, ECardSet, EClientMessageType, EErrorCode, EServerMessageType, ICardSet, ICreatemessage, IErrorMessage, IJoinMessage, IPauseMessage } from '../../../../../shared-lib/src';
import { CardService, CronService, EnvironmentService, HandlerService, LoggerService, MessageService, PreflightService, SenderService } from '../../../../src/services/implementation';
import { ICardService, ICronService, IEnvironmentService, IHandlerService, ILoggerService, IMessageService, IPreflightService, ISenderService } from '../../../../src/services/interfaces';
import { IWebSocket, ReadyState } from "../../../../src/services/websocket";
import { CardSetRepository, EstimationRepository, MembershipRepository, ServerParticipantRepository, StorageService, TeamRepository } from "../../../../src/storage/implementation";
import { ICardSetRepository, IEstimationRepository, IMembershipRepository, IServerParticipantRepository, IStorageService, ITeamRepository } from "../../../../src/storage/interfaces";
import { ITestParticipant, TestParticipant } from './TestParticipant';
import { UnaffectedTeam } from './UnaffectedTeam';
import { ITestScrumMaster } from './TestScrumMaster';

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

  public static expectedMessagesCreate = 6;
  public static expectedMessagesJoin = 6;


  public static getContainer(): Container {
    const logMock = new Mock<ILoggerService>()
      .setup((service: ILoggerService) => service.debug(It.IsAny(), It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.info(It.IsAny(), It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.warning(It.IsAny(), It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.error(It.IsAny(), It.IsAny()))
      .returns(undefined)
      .setup((service: ILoggerService) => service.logError(It.IsAny(), It.IsAny()))
      .returns(undefined);

    const container = new Container();
    container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
    container.bind<ICronService>(SERVICETYPES.CronService).to(CronService).inSingletonScope();
    container.bind<IEnvironmentService>(SERVICETYPES.EnvironmentService).to(EnvironmentService).inSingletonScope();
    container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
    container.bind<ILoggerService>(SERVICETYPES.LoggerService).toConstantValue(logMock.object());
    // container.bind<ILoggerService>(SERVICETYPES.LoggerService).to()
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

  public static getSocket(send: any): IWebSocket {
    return {
      readyState: ReadyState.OPEN,
      close: jest.fn(undefined),
      send: send
    }
  }




  public static extractMessage<T>(messages: Array<[message: string]>, messageType: EServerMessageType, occurrence = 0): T {
    return <T>messages
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((message: AServerMessage) => message.type === messageType)[occurrence];
  }



  public static errorMessageReceived(messages: Array<[message: string]>, errorCode: EErrorCode): boolean {
    const errorMessage = this.extractMessage<IErrorMessage>(messages, EServerMessageType.Error);
    return (errorMessage !== undefined) && errorMessage.data.code === errorCode;
  }

  public static createTeam(socket: IWebSocket, handlerService: IHandlerService, teamName: string, scrumMasterNick: string, cards?: ICardSet): string {
    const scrumMaster = handlerService.handleConnect(socket);
    const message: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: scrumMaster.participantId,
      data: {
        nick: scrumMasterNick,
        team: teamName,
        observer: false,
        cardSet: cards ? ECardSet.Custom : ECardSet.Cohn,
        cards: cards
      }
    }
    handlerService.handleMessage(message, teamName, socket);
    return scrumMaster.participantId;
  }

  public static joinTeam(socket: IWebSocket, handlerService: IHandlerService, teamName: string, nick: string, observer = false): string {
    const participant = handlerService.handleConnect(socket);
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: nick,
        observer: observer,
        team: teamName
      }
    };
    handlerService.handleMessage(message, teamName, socket);
    return participant.participantId;
  }

  public static connectParticipant(handlerService: IHandlerService): ITestParticipant {
    return new TestParticipant(handlerService);
  }

  public static joinTeamNew(handlerService: IHandlerService, teamName: string, nickName: string, observer = false): ITestParticipant {
    const participant = this.connectParticipant(handlerService);
    participant.teamName = teamName;
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: nickName,
        observer: observer,
        team: teamName
      }
    };
    participant.sendMessage(message);
    return participant;
  }

  public static joinTeamAndDisconnect(handlerService: IHandlerService, teamName: string, nickName: string, observer = false): ITestParticipant {
    const participant = this.joinTeamNew(handlerService, teamName, nickName, observer);
    participant.closeSocket();
    return participant;
  }

  public static joinTeamAndPause(handlerService: IHandlerService, teamName: string, nickName: string, observer = false): ITestParticipant {
    const participant = this.joinTeamNew(handlerService, teamName, nickName, observer);
    const message: IPauseMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Pause,
      data: undefined
    }
    participant.sendMessage(message);
    participant.closeSocket();
    return participant;
  }

  public static createTeamNew(
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
        team: teamName,
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
    const scrumMaster = this.createTeamNew(handlerService, teamName, 'Unaffected Scrum Master', false, ECardSet.Cohn);
    const participant = this.joinTeamNew(handlerService, teamName, 'Unaffected Participant');
    return new UnaffectedTeam(scrumMaster, participant, teamName);
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  public static noop(..._args: Array<unknown>): void { }
  /* eslint-enable @typescript-eslint/no-empty-function */
}