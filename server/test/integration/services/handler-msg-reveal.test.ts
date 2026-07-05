import { describe, expect, test } from '@jest/globals';
import {
  ECardSetType,
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  ERole,
  ErrorMessageDto,
  EServerMessageType,
  EstimationDto,
  EstimationListMessageDto,
  ParticipantChangedMessageDto,
  RevealMessageDto,
  StartMessageDto
} from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { BiTestFunction } from '../../types.js';
import { Util } from './helpers/util.js';

describe('Reveal => OK', () => {
  test('Standard use-case', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    const message: StartMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Setup: participant estimates
    const givenEstimation = 2;
    Util.estimate(participant, givenEstimation);

    // Setup: calculate the unknown estimation index for the Cohn cardset
    const unknownEstimationIndex = Util.unknownEstimationIndex(ECardSetType.Cohn);

    // Setup: validation method for the first estimation list message
    const checkFirstEstimationList: BiTestFunction<Array<EstimationDto>, number | null> = (
      estimations: Array<EstimationDto>,
      cardIndex: number | null
    ) => {
      expect(estimations).toHaveLength(1);
      expect(estimations[0].participantId).toBe(participant.participantId);
      if (cardIndex === null) {
        expect(estimations[0].cardIndex).toBeNull();
      } else {
        expect(estimations[0].cardIndex).toBe(cardIndex);
      }
    };

    // Setup: validation method for the second estimation list message
    const checkSecondEstimationList: BiTestFunction<Array<EstimationDto>, number | null> = (
      estimations: Array<EstimationDto>,
      cardIndex: number | null
    ) => {
      expect(estimations).toHaveLength(2);
      const participantEstimation = estimations.find(
        (e: EstimationDto) => e.participantId === participant.participantId
      );
      expect(participantEstimation?.cardIndex).toBe(cardIndex);
      const scrumMasterEstimation = estimations.find(
        (e: EstimationDto) => e.participantId === scrumMaster.participantId
      );
      expect(scrumMasterEstimation).toBeDefined();
      expect(scrumMasterEstimation?.cardIndex).toBe(unknownEstimationIndex);
    };

    // Run: Reveal
    const revealMessage: RevealMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) =>
        expect(m.data.changeType).toBe(EParticipantChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        checkFirstEstimationList(m.data, null)
      )
      .expectNextMessageIsGameStateChanged(EGameState.Revealed)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        checkSecondEstimationList(m.data, givenEstimation)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        checkFirstEstimationList(m.data, givenEstimation)
      )
      .expectNextMessageIsGameStateChanged(EGameState.Revealed)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        checkSecondEstimationList(m.data, givenEstimation)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Reveal => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: Run start
    const message: StartMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: RevealMessageDto = {
      senderId: 'unknown participant id',
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage, Util.team2Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) =>
        expect(m.data.changeType).toBe(EParticipantChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.Error, (m: ErrorMessageDto) =>
        expect(m.data.code).toBe(EErrorCode.ParticipantNotFound)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue();
    participant
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: Run start
    const message: StartMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: RevealMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) =>
        expect(m.data.changeType).toBe(EParticipantChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.Error, (m: ErrorMessageDto) =>
        expect(m.data.code).toBe(EErrorCode.TeamNotFound)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const teamLessParticipant = Util.connectParticipant(handlerService, ERole.ScrumMaster);

    // Setup: Run start
    const message: StartMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: RevealMessageDto = {
      senderId: teamLessParticipant.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    teamLessParticipant.sendMessage(revealMessage, Util.team1Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) =>
        expect(m.data.changeType).toBe(EParticipantChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: teamless participant
    teamLessParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.StartHandshake)
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender in another team ', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: Run start
    const message: StartMessageDto = {
      senderId: scrumMaster1.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster1.sendMessage(message);

    // Run: Reveal
    const revealMessage: RevealMessageDto = {
      senderId: scrumMaster2.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster2.sendMessage(revealMessage, Util.team1Name);

    // Test: scrum master messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) =>
        expect(m.data.changeType).toBe(EParticipantChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    participant1
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test participant 2
    scrumMaster2
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();
    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('poker status is not started', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: Reveal
    const revealMessage: RevealMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage);

    // Test: Scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) =>
        expect(m.data.changeType).toBe(EParticipantChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.Error, (m: ErrorMessageDto) =>
        expect(m.data.code).toBe(EErrorCode.EstimationNotStarted)
      )
      .expectNoMoreMessages();

    // Test: participant should have received no messages
    participant.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender not scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: Run start
    const message: StartMessageDto = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: RevealMessageDto = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    participant.sendMessage(revealMessage);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) =>
        expect(m.data.changeType).toBe(EParticipantChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIsError(EErrorCode.ScrumMasterRequired)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
