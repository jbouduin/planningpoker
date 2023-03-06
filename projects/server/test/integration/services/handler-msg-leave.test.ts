import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberChangeType, EParticipantStatus, EServerMessageType, ILeaveMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Leaving => OK', () => {
  test('Developer leaving', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // participant leaves
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    participant.sendMessage(message);
    participant.closeSocket();

    // Test: scrum master should have received 2 MC join + 1 MC leave
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Left)).toBe(1);
    let leftMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: observer should have received 1 MC leave
    expect(observer.messagesReceivedAfterInitial).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberChangeType.Left)).toBe(1);
    leftMessage = observer.extractMemberChangedMessage(EMemberChangeType.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: participant should have received 1 MC join memberchange + 1 Left
    expect(participant.messagesReceivedAfterInitial).toBe(2);
    expect(participant.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.Left)).toBe(1);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Developer leaving after being disconnected', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // participant 1 reconnects to leave
    const reconnect = Util.connectParticipant(handlerService);
    // participant 1 leaves
    const message: ILeaveMessage = {
      senderId: reconnect.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    reconnect.sendMessage(message, Util.team1Name);
    reconnect.closeSocket();

    // Test: scrum master should have received 2 MC join + 1 MC disconnected + 1 MC leave
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Left)).toBe(1);
    let leftMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: observer should have received + 1 MC disconnect + 1 MC leave
    expect(observer.messagesReceivedAfterInitial).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberChangeType.Left)).toBe(1);
    leftMessage = observer.extractMemberChangedMessage(EMemberChangeType.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: participant should have received his init message
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: reconnected participant should have received init messages + his own leave acknowledge message
    expect(reconnect.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(reconnect.countMessagesOfType(EServerMessageType.Left, false)).toBe(1);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2385 leaving during estimations should remove estimation if participant has made one

  test('Scrum Master leaving', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // scrum master leaves
    const message: ILeaveMessage = {
      senderId: scrumMaster.participantId,
      data: scrumMaster.participantId,
      type: EClientMessageType.Leave
    };
    scrumMaster.sendMessage(message);
    // clients will close their socket as a reaction on the session ended message
    scrumMaster.closeSocket();
    participant.closeSocket();
    observer.closeSocket();

    // Test: scrum master should have received 2 MC join  + 1 session ended
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.EndSession)).toBe(1);

    // Test: participant should have received 1 MC join + 1 session ended
    expect(participant.messagesReceivedAfterInitial).toBe(2);
    expect(participant.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.EndSession)).toBe(1);

    // Test: observer should have received 1 session ended
    expect(observer.messagesReceivedAfterInitial).toBe(1);

    expect(observer.countMessagesOfType(EServerMessageType.EndSession)).toBe(1);
    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});

describe('Leaving => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // send leave message
    const message: ILeaveMessage = {
      senderId: 'some participant id',
      type: EClientMessageType.Leave,
      data: 'some participant id'
    };
    participant.sendMessage(message);

    // Test: participant should only have received the error message
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: scrum master should only have received 1 MC Join
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create the team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // connect the participant
    const participant = Util.connectParticipant(handlerService);
    // send leave message for team 2
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    participant.sendMessage(message, Util.team2Name);

    // Participant should only receive 1 init and 1 error message
    expect(participant.totalMessagesReceived).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.TeamDoesNotExist)).toBe(true);

    // scrum master should not have received any additional messages
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant connects
    const participant = Util.connectParticipant(handlerService);
    // send leave message
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    participant.sendMessage(message, Util.team1Name);

    // Test: participant should only have received the init and the error message
    expect(participant.totalMessagesReceived).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantNotInTeam)).toBe(true);

    // Test: scrum master should not have received any additional messages
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender in different team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // send leave message for another team
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    participant.sendMessage(message, unaffectedTeam.teamName);

    // Test: participant should only have received the error message
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantNotInTeam)).toBe(true);

    // Test: scrum master should only have received 1 MC Joined
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});
