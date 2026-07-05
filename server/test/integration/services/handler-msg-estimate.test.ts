import { describe, expect, test } from '@jest/globals';
import {
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EServerMessageType,
  EstimateMessageDto,
  EstimationDto,
  EstimationListMessageDto,
  EstimationWithdrawnMessageDto
} from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { BiTestFunction } from '../../types.js';
import { Util } from './helpers/util.js';

describe('Estimate => OK', () => {
  test('Standard use-case', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: validate estimationlist
    const validateEstimationListFn: BiTestFunction<Array<EstimationDto>, number | null> = (
      l: Array<EstimationDto>,
      cardIndex: number | null
    ) => {
      expect(l).toHaveLength(1);
      expect(l[0].participantId).toBe(participant.participantId);
      if (cardIndex !== null) {
        expect(l[0].cardIndex).toBe(cardIndex);
      } else {
        expect(l[0].cardIndex).toBeNull();
      }
    };
    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Run: estimate
    Util.estimate(participant, 2);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, null)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, 2)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Withdraw estimation', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: validate estimationlist
    const validateEstimationListFn: BiTestFunction<Array<EstimationDto>, number | null> = (
      l: Array<EstimationDto>,
      cardIndex: number | null
    ) => {
      expect(l).toHaveLength(1);
      expect(l[0].participantId).toBe(participant.participantId);
      if (cardIndex != null) {
        expect(l[0].cardIndex).toBe(cardIndex);
      } else {
        expect(l[0].cardIndex).toBeNull();
      }
    };

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Setup: estimate
    Util.estimate(participant, 2);

    // Setup: withdraw
    Util.withdrawEstimation(participant);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, null)
      )
      .expectNextMessageIs(EServerMessageType.EstimationWithdrawn, (m: EstimationWithdrawnMessageDto) => {
        expect(m.data.participantId).toBe(participant.participantId);
      })
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, 2)
      )
      .expectNextMessageIs(EServerMessageType.EstimationWithdrawn, (m: EstimationWithdrawnMessageDto) => {
        expect(m.data.participantId).toBe(participant.participantId);
      })
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Update estimation', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: validate estimationlist
    const validateEstimationListFn: BiTestFunction<Array<EstimationDto>, number | null> = (
      l: Array<EstimationDto>,
      cardIndex: number | null
    ) => {
      expect(l).toHaveLength(1);
      expect(l[0].participantId).toBe(participant.participantId);
      if (cardIndex === null) {
        expect(l[0].cardIndex).toBeNull();
      } else {
        expect(l[0].cardIndex).toBe(cardIndex);
      }
    };

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Setup: estimate
    Util.estimate(participant, 2);

    // Run: update estimation
    Util.estimate(participant, 3);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, null)
      )
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, null)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, 2)
      )
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, 3)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Estimate => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Run: estimate
    const estimateMessage: EstimateMessageDto = {
      senderId: Util.unknownParticipantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Run: estimate
    const estimateMessage: EstimateMessageDto = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIsError(EErrorCode.TeamNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: connect participant
    const participant = Util.connectParticipant(handlerService);

    // Run: estimate
    const estimateMessage: EstimateMessageDto = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage, unaffectedTeam.teamName);

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsStartHandshake()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender in another team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Run: estimate
    const estimateMessage: EstimateMessageDto = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage, unaffectedTeam.teamName);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Game status is "not started"', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: estimate
    Util.estimate(participant, 2);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.EstimationNotStarted)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Card index out of range', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Run: estimate
    Util.estimate(participant, 55);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIsError(EErrorCode.InvalidEstimation)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender is observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Setup: start estimation
    Util.startEstimating(scrumMaster);

    // Run: estimate
    Util.estimate(observer, 2);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIsError(EErrorCode.ObserverCanNotEstimate)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
