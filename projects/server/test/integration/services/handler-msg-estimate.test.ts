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
      data: 3,
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
      expect(estimationListMessage.data[0].cardIndex).toBe(3);
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
      expect(estimationListMessage.data[0].cardIndex).toBe(3);
    }

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
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
    participant.sendMessage(estimateMessage, Util.team2Name);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 pokerstatus
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: participant should have received 1 clear + 1 pokerstatus + 1 error
    expect(participant.messagesReceivedAfterInitial).toBe(3);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.TeamDoesNotExist)).toBe(true);

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

    // Setup: start estimation
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: "unknown participant id",
      data: 2,
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
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

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
    const teamLessParticipant = Util.connectParticipant(handlerService);

    // Setup: start estimation
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: teamLessParticipant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    teamLessParticipant.sendMessage(estimateMessage, Util.team1Name);

    // Test: scrum master should have received 1 MC join + 1 clear + 1 pokerstatus
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: participant should have received 1 clear + 1 pokerstatus
    expect(participant.messagesReceivedAfterInitial).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: teamless participant should have received Init + Error
    expect(teamLessParticipant.totalMessagesReceived).toBe(2);
    expect(teamLessParticipant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(teamLessParticipant.errorMessageReceived(EErrorCode.ParticipantNotInTeam)).toBe(true);

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender in different team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);

    // Setup: start estimation
    const message: IStartMessage = {
      senderId: scrumMaster1.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster1.sendMessage(message);

    // Run: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: participant2.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant2.sendMessage(estimateMessage, Util.team1Name);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 pokerstatus
    expect(scrumMaster1.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster1.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster1.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster1.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: participant 1 should have received 1 clear + 1 pokerstatus
    expect(participant1.messagesReceivedAfterInitial).toBe(2);
    expect(participant1.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant1.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: participant 2 should have received 1 error
    expect(participant2.messagesReceivedAfterInitial).toBe(1);
    expect(participant2.errorMessageReceived(EErrorCode.ParticipantNotInTeam)).toBe(true);

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
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: estimate
    const estimateMessage: IEstimateMessage = {
      senderId: observer.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    observer.sendMessage(estimateMessage);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 pokerstatus
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: observer should have received 1 clear + 1 pokerstatus + 1 Error
    expect(observer.messagesReceivedAfterInitial).toBe(3);
    expect(observer.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(observer.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(observer.errorMessageReceived(EErrorCode.ObserverCanNotEstimate)).toBe(true);

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});