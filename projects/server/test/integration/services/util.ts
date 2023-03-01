import { jest } from '@jest/globals';
import { Container } from "inversify";

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { CardService, CronService, EnvironmentService, HandlerService, LoggerService, MessageService, PreflightService, SenderService } from '../../../src/services/implementation';
import { ICardService, ICronService, IEnvironmentService, IHandlerService, ILoggerService, IMessageService, IPreflightService, ISenderService } from '../../../src/services/interfaces';
import { IWebSocket, ReadyState } from "../../../src/services/websocket";
import { CardSetRepository, EstimationRepository, MembershipRepository, ServerParticipantRepository, StorageService, TeamRepository } from "../../../src/storage/implementation";
import { ICardSetRepository, IEstimationRepository, IMembershipRepository, IServerParticipantRepository, IStorageService, ITeamRepository } from "../../../src/storage/interfaces";
import { AServerMessage, ECardSet, EClientMessageType, EErrorCode, EServerMessageType, ICard, ICardSet, ICreatemessage, IErrorMessage } from '../../../../shared-lib/src';

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
    const container = new Container();
    container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
    container.bind<ICronService>(SERVICETYPES.CronService).to(CronService).inSingletonScope();
    container.bind<IEnvironmentService>(SERVICETYPES.EnvironmentService).to(EnvironmentService).inSingletonScope();
    container.bind<IHandlerService>(SERVICETYPES.HandlerService).to(HandlerService);
    container.bind<ILoggerService>(SERVICETYPES.LoggerService).to(LoggerService).inSingletonScope();
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

  public static sleep(milliSeconds: number): Promise<unknown> {
    return new Promise(r => setTimeout(r, milliSeconds));
  }

  public static countMessageType(messages: Array<[message: string]>, messageType: EServerMessageType): number {
    return messages
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((message: AServerMessage) => message.type === messageType)
      .length
  }

  public static extractMessage<T>(messages: Array<[message: string]>, messageType: EServerMessageType): T {
    return <T>messages
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .find((message: AServerMessage) => message.type === messageType);
  }

  public static errorMessageReceived(messages: Array<[message: string]>, errorCode: EErrorCode): boolean {
    const errorMessage = this.extractMessage<IErrorMessage>(messages, EServerMessageType.Error);
    return errorMessage && errorMessage.data.code === errorCode;
  }

  public static createTeam(socket: IWebSocket, handlerService: IHandlerService, team: string, scrumMaster: string, cards?: ICardSet ): void {
    const participant1 = handlerService.handleConnect(socket);
    const message1: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: participant1.participantId,
      data: {
        nick: scrumMaster,
        team: team,
        observer: false,
        cardSet: cards ? ECardSet.Custom : ECardSet.Cohn,
        cards: cards
      }
    }
    handlerService.handleMessage(message1, team, socket);
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  public static noop(..._args: Array<unknown>): void { }
  /* eslint-enable @typescript-eslint/no-empty-function */
}