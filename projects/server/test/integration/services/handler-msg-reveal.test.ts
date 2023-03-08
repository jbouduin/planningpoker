import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, EPokerStatus, ERole, EServerMessageType, IErrorMessage, IEstimateMessage, IEstimation, IEstimationListMessage, IMemberChangeMessage, IPokerStatusChangedMessage, IRevealMessage, IStartMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";


describe('Reveal => OK', () => {
  test('Reveal', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Setup: participant estimates
    const givenEstimation = 2;
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: givenEstimation,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Setup: calculate the unknown estimation index for the Cohn cardset
    const unknownEstimationIndex = Util.unknownEstimationIndex(ECardSet.Cohn);

    // Setup: validation method for the first estimation list message
    const checkFirstEstimationList = (estimations: Array<IEstimation>) => {
      expect(estimations).toHaveLength(1);
      expect(estimations[0].participantId).toBe(participant.participantId);
      expect(estimations[0].cardIndex).toBe(givenEstimation);
    }

    // Setup: validation method for the second estimation list message
    const checkSecondEstimationList = (estimations: Array<IEstimation>) => {
      expect(estimations).toHaveLength(2);
      const participantEstimation = estimations.find((e: IEstimation) => e.participantId === participant.participantId);
      expect(participantEstimation).toBeDefined();
      expect(participantEstimation?.cardIndex).toBe(givenEstimation);
      const scrumMasterEstimation = estimations.find((e: IEstimation) => e.participantId === scrumMaster.participantId);
      expect(scrumMasterEstimation).toBeDefined();
      expect(scrumMasterEstimation?.cardIndex).toBe(unknownEstimationIndex);
    }

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.MemberChanged,
        (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe(EMemberChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => checkFirstEstimationList(m.data)
      )
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Revealed)
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => checkSecondEstimationList(m.data)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => m.data === EPokerStatus.Started
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => checkFirstEstimationList(m.data)
      )
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Revealed)
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => checkSecondEstimationList(m.data)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});


describe('Reveal => Failure', () => {
  test('poker status is not started', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage);

    // Test: Scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.MemberChanged,
        (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe(EMemberChangeType.Joined)
      )
      .expectNextMessageIs(
        EServerMessageType.Error,
        (m: IErrorMessage) => expect(m.data.code).toBe(EErrorCode.EstimationNotStarted)
      )
      .expectNoMoreMessages();

    // Test: participant should have received no messages
    participant
      .initializeMessageQueue()
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
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage, Util.team2Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.MemberChanged,
        (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe(EMemberChangeType.Joined)
      )
      .expectNextMessageIs(
        EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNextMessageIs(
        EServerMessageType.Error,
        (m: IErrorMessage) => expect(m.data.code).toBe(EErrorCode.TeamDoesNotExist)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: Run start
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: 'unknown participant id',
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage, Util.team2Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.MemberChanged,
        (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe(EMemberChangeType.Joined)
      )
      .expectNextMessageIs(
        EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNextMessageIs(
        EServerMessageType.Error,
        (m: IErrorMessage) => expect(m.data.code).toBe(EErrorCode.ParticipantNotFound)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
    participant.expectNextMessageIs(
      EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNoMoreMessages();

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
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    participant.sendMessage(revealMessage);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.MemberChanged,
        (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe(EMemberChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNextMessageIsError(EErrorCode.ScrumMasterRequired)
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
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: teamLessParticipant.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    teamLessParticipant.sendMessage(revealMessage, Util.team1Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.MemberChanged,
        (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe(EMemberChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNoMoreMessages();

    // Test: teamless participant
    teamLessParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender in different team ', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: Run start
    const message: IStartMessage = {
      senderId: scrumMaster1.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster1.sendMessage(message);

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: scrumMaster2.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster2.sendMessage(revealMessage, Util.team1Name);

    // Test: scrum master messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.MemberChanged,
        (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe(EMemberChangeType.Joined)
      )
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant1
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.ClearEstimations)
      .expectNextMessageIs(
        EServerMessageType.PokerStatus,
        (m: IPokerStatusChangedMessage) => expect(m.data).toBe(EPokerStatus.Started)
      )
      .expectNoMoreMessages();

    // Test participant 2
    scrumMaster2
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();
    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});