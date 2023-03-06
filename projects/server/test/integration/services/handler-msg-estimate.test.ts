import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberChangeType, EServerMessageType, IEstimateMessage, IEstimationListMessage, IStartMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";


describe('Estimate => OK', () => {
  test('Give estimation', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster= Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant= Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimation
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 pokerstatus + 1 estimation list
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.EstimationList)).toBe(1);
    let estimationListMessage = scrumMaster.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(1);
      expect(estimationListMessage.data[0].participantId).toBe(participant.participantId);
      expect(estimationListMessage.data[0].cardIndex).toBe(2);
    }

    // Test: participant should have received 1 clear + 1 pokerstatus + 1 additional estimation list
    expect(participant.messagesReceivedAfterInitial).toBe(3);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.EstimationList)).toBe(1);
    estimationListMessage = participant.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(1);
      expect(estimationListMessage.data[0].participantId).toBe(participant.participantId);
      expect(estimationListMessage.data[0].cardIndex).toBe(2);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Withdraw estimation', () => {
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

    // Setup: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    const withDrawMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(withDrawMessage);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 pokerstatus + 2 estimation list
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(5);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.EstimationList)).toBe(2);
    let estimationListMessage = scrumMaster.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList, true, 1);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(1);
      expect(estimationListMessage.data[0].participantId).toBe(participant.participantId);
      expect(estimationListMessage.data[0].cardIndex).toBeUndefined();
    }

    // Test: participant should have received 1 clear + 1 pokerstatus + 2 estimation list
    expect(participant.messagesReceivedAfterInitial).toBe(4);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.EstimationList)).toBe(2);
    estimationListMessage = participant.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList, true, 1);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(1);
      expect(estimationListMessage.data[0].participantId).toBe(participant.participantId);
      expect(estimationListMessage.data[0].cardIndex).toBeUndefined();
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2380 test('Update estimation', () => { });
});


describe('Estimate => Failure', () => {
  test('poker status is not started', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Test: scrum master 1 should have received 1 MC join
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: participant should have received 1 Error
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.EstimationNotStarted));

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
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
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 55,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 pokerstatus
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: participant should have received 1 clear + 1 pokerstatus + 1 error
    expect(participant.messagesReceivedAfterInitial).toBe(3);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.InvalidEstimation)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2380 test('Team not found', () => { });
  // TODO 2380 test('Sender not found', () => { });
  // TODO 2380 test('Sender not in any team', () => { });
  // TODO 2380 test('Sender in different team', () => { });
  // TODO 2380 test('Sender is observer', () => { });
});