import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EErrorCode, EMemberChangeType, EServerMessageType, IEstimateMessage, IRevealMessage, IStartMessage } from '../../../../shared-lib/src';
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
    // TODO 2381 add a third participant who does not estimate

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

    // Run: Reveal
    const revealMessage: IRevealMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    scrumMaster.sendMessage(revealMessage);

    // Test: scrum master 1 should have received 1 MC join + 1 clear + 2 pokerstatus + 2 estimation list
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(6);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1)
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.EstimationList)).toBe(2);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(2);
    // TODO 2381 check the messages

    // Test: participant 1 should have received 1 clear + 2 pokerstatus + 2 estimation list
    expect(participant.messagesReceivedAfterInitial).toBe(5);
    expect(participant.countMessagesOfType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.EstimationList)).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.PokerStatus)).toBe(2);
    // TODO 2381 check the messages

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
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

    // Test: scrum master 1 should have received 1 MC join + 1 Error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1)
    expect(scrumMaster.errorMessageReceived(EErrorCode.EstimationNotStarted));
    // TODO 2381 check the messages

    // Test: participant 1 should have received no messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);


    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
  // TODO 2381 test('team not found', () => { });
  // TODO 2381 test('Sender not found', () => { });
  // TODO 2381 test('Sender not scrum master', () => { });
  // TODO 2381 test('Sender not in any team', () => { });
  // TODO 2381 test('Sender in different team ', () => { });
});