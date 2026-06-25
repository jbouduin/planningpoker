import { describe, expect, test } from '@jest/globals';
import {
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EParticipantState,
  EServerMessageType,
  IEstimateMessage,
  IEstimationListMessage,
  IPauseMessage,
  IStartMessage
} from 'shared-lib';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from './helpers/util';

describe('Pause => OK', () => {
  test('pause', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: pause
    const message: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    };
    participant.sendMessage(message);
    // Run: participant will close his socket as a result of the response
    participant.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Paused, {
        participantId: participant.participantId,
        state: EParticipantState.Paused
      })
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsSelf({ state: EParticipantState.Paused })
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('pause during estimations', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name);

    // Setup: start estimating
    const startMessage: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(startMessage);

    // Setup: participant estimates
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Run: pause
    const message: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    };
    participant.sendMessage(message);
    // Run: participant will close his socket as a result of the response
    participant.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsPokerStatus(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsMemberChange(EParticipantChangeType.Paused, {
        participantId: participant.participantId,
        state: EParticipantState.Paused
      })
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsPokerStatus(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsSelf({ state: EParticipantState.Paused })
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsPokerStatus(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsMemberChange(EParticipantChangeType.Paused, {
        participantId: participant.participantId,
        state: EParticipantState.Paused
      })
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();
    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Pause => Failure', () => {
  // TODO 2390 test('Sender not found', () => { });

  test('team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: pause
    const message: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    };
    participant.sendMessage(message, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue().expectNextMessageIsError(EErrorCode.TeamNotFound).expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.connectParticipant(handlerService);

    // Run: pause
    const message: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    };
    participant.sendMessage(message, Util.team1Name);

    // Test: scrum master messages
    scrumMaster.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // TODO 2391 test('Sender in another team', () => { });
});
