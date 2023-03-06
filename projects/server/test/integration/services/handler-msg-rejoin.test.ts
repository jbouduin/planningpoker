import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EMemberChangeType, ERole, EServerMessageType, IRejoinMessage, ISelfMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Rejoin => OK', () => {
  test('Rejoin after disconnect', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with one disconnected participant
    const scrumMaster =     Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant =  Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // create a new connection to rejoin
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    rejoiningParticipant.teamName = Util.team1Name;
    // rejoin
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected + 1 MC rejoin
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Rejoined)).toBe(1);
    // TODO 2382 check the message contents of the rejoin

    // Test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have received join messages
    expect(rejoiningParticipant.messagesReceivedAfterInitial).toBe(0);

    // TODO 2382 check if the rejoin messages reflect the current team status

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('assign first reconnecting scrum master role', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: disconnect scrum master
    scrumMaster.closeSocket();

    // RUN: reconnect
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    rejoiningParticipant.teamName = Util.team1Name;
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: disconnected.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 1 should have received no additional messages
    expect(disconnected.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have received a self message
    expect(rejoiningParticipant.messagesReceivedAfterInitial).toBe(1);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Self)).toBe(1);
    const selfMessage = rejoiningParticipant.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.participantId).toBe(disconnected.participantId);
      expect(selfMessage.data.role).toBe(ERole.ScrumMaster);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('assign first reconnecting is scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: disconnect scrum master
    scrumMaster.closeSocket();

    // RUN: reconnect
    const rejoiningScrumMaster = Util.connectParticipant(handlerService);
    rejoiningScrumMaster.teamName = Util.team1Name;
    const message: IRejoinMessage = {
      senderId: rejoiningScrumMaster.participantId,
      data: scrumMaster.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningScrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 1 should have received no additional messages
    expect(disconnected.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have received no additional messages
    expect(rejoiningScrumMaster.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2382 test('Rejoin after pause', () => { });
  // TODO 2382 test('Rejoin during estimation', () => { });
});


describe('Remove => Failure', () => {
  // TODO 2382 test('Team not found', () => { });
  // TODO 2382 test('Sender not found', () => { });
  // TODO 2382 test('Sender already in a team', () => { });
  // TODO 2382 test('Old participant not found', () => { });
  // TODO 2382 test('Old participant in different team', () => { });
});