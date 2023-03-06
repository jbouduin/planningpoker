import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberChangeType, EPokerStatus, EServerMessageType, IPokerStatusChangedMessage, IStartMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";


describe('Start => OK', () => {
  test('Start', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: Create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // start estimating
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 poker status
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    let pokerStatusMessage = scrumMaster.extractMessage<IPokerStatusChangedMessage>(EServerMessageType.PokerStatus);
    expect(pokerStatusMessage).toBeDefined();
    if (pokerStatusMessage) {
      expect(pokerStatusMessage.data).toBe(EPokerStatus.Started);
    }

    // Test: participant 1 should have received 1 clear + 1 poker status
    expect(participant.messagesReceivedAfterInitial).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    pokerStatusMessage = participant.extractMessage<IPokerStatusChangedMessage>(EServerMessageType.PokerStatus);
    expect(pokerStatusMessage).toBeDefined();
    if (pokerStatusMessage) {
      expect(pokerStatusMessage.data).toBe(EPokerStatus.Started);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});

describe('start => Failure', () => {
  test('Sender not scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: Create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant
    const scrumMaster=    Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // send start estimating
    const message: IStartMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    participant.sendMessage(message);

    // Test: scrum master should have received 1 MC Join
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: participant should have received 1 error
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ScrumMasterRequired)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: Create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create the team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // connect the participant
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // send start estimating to the wrong team
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message, Util.team2Name);

    // Test: scrum master should have received  1 join + 1 error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.TeamDoesNotExist)).toBe(true);

    // Test: participant 1 should have received no messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: Create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // start estimating
    const message: IStartMessage = {
      senderId: 'some participant id',
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 1 MC Join + 1 error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: participant 1 should have received no messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // impossible scenario: scrum master not in a team

  test('Sender in another team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: Create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // send start estimating to another team
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message, unaffectedTeam.teamName);

    // Test: scrum master should have received 1 MC join + 1 error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNotInTeam)).toBe(true);

    // Test: participant 1 should have received nothing
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('poker status is started', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: Create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: start estimating
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Run: start a second time
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 1 poker status + 1 error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.EstimationAlreadyStarted)).toBe(true);

    // Test: participant 1 should only have received 1 clear + 1 poker status
    expect(participant.messagesReceivedAfterInitial).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(1);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('only observers connected', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: Create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick, true);
    const observer1 = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);
    const observer2 = Util.joinTeam(handlerService, Util.team1Name, Util.observer2Name, true);

    // Run: start estimating
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 2 MC join + 1 error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(scrumMaster.errorMessageReceived(EErrorCode.OnlyObserversOnline)).toBe(true);

    // Test: observer 1 should only have received 1 MC Join
    expect(observer1.messagesReceivedAfterInitial).toBe(1);
    expect(observer1.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: observer 2 should have received no messages
    expect(observer2.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
})