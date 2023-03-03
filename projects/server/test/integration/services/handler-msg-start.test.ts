import { describe, expect, jest, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EPokerStatus, EServerMessageType, IPokerStatusChangedMessage, IStartMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Start => OK', () => {
  test('Start', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    const scrumMaster1ParticipantId = Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);

    // start estimating
    const message: IStartMessage = {
      senderId: scrumMaster1ParticipantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMaster1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 clear message + 1 status change message
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.ClearEstimations)).toBe(1);
    expect(Util.countFilteredMessages<IPokerStatusChangedMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => m.data === EPokerStatus.Started)
    ).toBe(1);

    // test: participant 1 should have received join messages + 1 clear message + 1 status change message
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.ClearEstimations)).toBe(1);
    expect(Util.countFilteredMessages<IPokerStatusChangedMessage>(
      participant1Send.mock.calls,
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => m.data === EPokerStatus.Started)
    ).toBe(1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  })
});

describe('start => Failure', () => {
  test('Sender not scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    const participantId = Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);

    // start estimating
    const message: IStartMessage = {
      senderId: participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    handlerService.handleMessage(message, Util.team1Name, participant1Socket);

    // test: scrum master should have received create messages + 1 join
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.errorMessageReceived(scrumMaster1Send.mock.calls, EErrorCode.ScrumMasterRequired)).toBe(false);

    // test: participant 1 should have received join messages + error message
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(participant1Send.mock.calls, EErrorCode.ScrumMasterRequired)).toBe(true);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Team does not exist', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    const scrumMasterParticipantId = Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);

    // start estimating
    const message: IStartMessage = {
      senderId: scrumMasterParticipantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    handlerService.handleMessage(message, Util.team2Name, scrumMaster1Socket);

    // test: scrum master should have received create messages + 1 join + 1 error
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.errorMessageReceived(scrumMaster1Send.mock.calls, EErrorCode.TeamDoesNotExist)).toBe(true);

    // test: participant 1 should have received join messages only
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesJoin);
    expect(Util.errorMessageReceived(participant1Send.mock.calls, EErrorCode.TeamDoesNotExist)).toBe(false);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender does not exist', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);
    // start estimating
    const message: IStartMessage = {
      senderId: 'some participant id',
      data: undefined,
      type: EClientMessageType.Start
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMaster1Socket);

    // test: scrum master should have received create messages + 1 join + 1 error
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.errorMessageReceived(scrumMaster1Send.mock.calls, EErrorCode.ParticipantNotFound)).toBe(true);

    // test: participant 1 should have received join messages only
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesJoin);
    expect(Util.errorMessageReceived(participant1Send.mock.calls, EErrorCode.ParticipantNotFound)).toBe(false);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // impossible scenario: scrum master not in a team

  test('Sender in another team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    const scrumMaster1ParticipantId = Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);

    // start estimating
    const message: IStartMessage = {
      senderId: scrumMaster1ParticipantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    handlerService.handleMessage(message, unaffectedTeam.teamName, scrumMaster1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 error
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.errorMessageReceived(scrumMaster1Send.mock.calls, EErrorCode.ParticipantNotInTeam)).toBe(true);

    // test: participant 1 should have received join messages only
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesJoin);
    expect(Util.errorMessageReceived(participant1Send.mock.calls, EErrorCode.ParticipantNotInTeam)).toBe(false);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2370 test('poker status is started', () => { });
  // TODO 2370 test('only observers connected', () => { });
})