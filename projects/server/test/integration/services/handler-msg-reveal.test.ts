import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, EPokerStatus, EServerMessageType, IErrorMessage, IEstimateMessage, IEstimation, IEstimationListMessage, IMemberChangeMessage, IPokerStatusChangedMessage, IRevealMessage, IStartMessage } from '../../../../shared-lib/src';
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
    scrumMaster.initializeMessageIterator();
    scrumMaster.expectNextMessageIs(
      EServerMessageType.MemberChanged,
      (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe( EMemberChangeType.Joined)
    );
    scrumMaster.expectNextMessageIs(EServerMessageType.ClearEstimations);
    scrumMaster.expectNextMessageIs(
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => expect(m.data).toBe( EPokerStatus.Started)
    );
    scrumMaster.expectNextMessageIs(
      EServerMessageType.EstimationList,
      (m: IEstimationListMessage) => checkFirstEstimationList(m.data)
    );
    scrumMaster.expectNextMessageIs(
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => expect(m.data).toBe( EPokerStatus.Revealed)
    );
    scrumMaster.expectNextMessageIs(
      EServerMessageType.EstimationList,
      (m: IEstimationListMessage) => checkSecondEstimationList(m.data)
    );

    // Test: participant messages
    participant.initializeMessageIterator();
    participant.expectNextMessageIs(EServerMessageType.ClearEstimations);
    participant.expectNextMessageIs(
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => m.data === EPokerStatus.Started
    );
    participant.expectNextMessageIs(
      EServerMessageType.EstimationList,
      (m: IEstimationListMessage) => checkFirstEstimationList(m.data)
    );
    participant.expectNextMessageIs(
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => expect(m.data) .toBe( EPokerStatus.Revealed)
    );
    participant.expectNextMessageIs(
      EServerMessageType.EstimationList,
      (m: IEstimationListMessage) => checkSecondEstimationList(m.data)
    );
    participant.expectNoMoreMessages();

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
    scrumMaster.initializeMessageIterator();
    scrumMaster.expectNextMessageIs(
      EServerMessageType.MemberChanged,
      (m: IMemberChangeMessage) => expect(m.data.memberStatusChange).toBe( EMemberChangeType.Joined)
    );
    scrumMaster.expectNextMessageIs(
      EServerMessageType.Error,
      (m: IErrorMessage) => expect(m.data.code).toBe( EErrorCode.EstimationNotStarted)
    );
    scrumMaster.expectNoMoreMessages();

    // Test: participant should have received no messages
    participant.initializeMessageIterator();
    participant.expectNoMoreMessages();

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
    scrumMaster.initializeMessageIterator();
    scrumMaster.expectNextMessageIs(
      EServerMessageType.MemberChanged,
      (m: IMemberChangeMessage) => expect(m.data.memberStatusChange ).toBe( EMemberChangeType.Joined)
    );
    scrumMaster.expectNextMessageIs(
      EServerMessageType.ClearEstimations);
    scrumMaster.expectNextMessageIs(
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => expect( m.data).toBe( EPokerStatus.Started)
    );
    scrumMaster.expectNextMessageIs(
      EServerMessageType.Error,
      (m: IErrorMessage) => expect(m.data.code).toBe( EErrorCode.TeamDoesNotExist)
    );
    scrumMaster.expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageIterator();
    participant.expectNextMessageIs(
      EServerMessageType.ClearEstimations);
    participant.expectNextMessageIs(
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => expect(m.data).toBe( EPokerStatus.Started)
    );
    participant.expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
  // TODO 2381 test('Sender not found', () => { });
  // TODO 2381 test('Sender not scrum master', () => { });
  // TODO 2381 test('Sender not in any team', () => { });
  // TODO 2381 test('Sender in different team ', () => { });
});