import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, EParticipantStatus, ERole, EServerMessageType, ICardSetMessage, IEstimationListMessage, IMemberListMessage, IPauseMessage, IRejoinMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";
import STORAGETYPES from '../../../src/storage/storage.types';
import { IFactoryService } from '../../../src/storage/interfaces';

describe('Rejoin => OK', () => {
  test('Rejoin after disconnect', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: create a new connection to rejoin and send rejoin message
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message, Util.team1Name);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected + 1 MC rejoin
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Rejoined)).toBe(1);
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.Rejoined);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.member.participantId).toBe(participant.participantId);
      expect(memberChangedMessage.data.member.status).toBe(EParticipantStatus.Connected);
    }

    // Test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have received join messages
    expect(rejoiningParticipant.totalMessagesReceived).toBe(participant.expectedNumberOfInitialMessages);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Self, false)).toBe(1);
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.participantId).toBe(participant.participantId);
      expect(selfMessage.data.nick).toBe(Util.participant1Nick);
      expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
      expect(selfMessage.data.role).toBe(ERole.Developer);
      expect(selfMessage.data.observer).toBe(false);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.TeamName, false)).toBe(1);
    const teamMessage = rejoiningParticipant.extractMessage<ITeamNameMessage>(EServerMessageType.TeamName, false);
    if (teamMessage) {
      expect(teamMessage.data).toBe(Util.team1Name);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.CardList, false)).toBe(1);
    const cardListMessage = rejoiningParticipant.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardListMessage).toBeDefined();
    if (cardListMessage) {
      expect(cardListMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardListMessage.data.cards).toHaveLength(cohn.cards.length);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.MemberList, false)).toBe(1);
    const memberListMessage = rejoiningParticipant.extractMessage<IMemberListMessage>(EServerMessageType.MemberList, false);
    expect(memberListMessage).toBeDefined();
    if (memberListMessage) {
      expect(memberListMessage.data).toHaveLength(1);
      expect(memberListMessage.data[0].nick).toBe(Util.scrumMaster1Nick);
      expect(memberListMessage.data[0].role).toBe(ERole.ScrumMaster);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.EstimationList, false)).toBe(1);
    const estimationListMessage = rejoiningParticipant.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList, false);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(0);
    }

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
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: disconnected.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message, Util.team1Name);

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

  test('first reconnecting is already scrum master', () => {
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
    const message: IRejoinMessage = {
      senderId: rejoiningScrumMaster.participantId,
      data: scrumMaster.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningScrumMaster.sendMessage(message, Util.team1Name);

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

  test('Rejoin after pause', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: participants sends pause message
    const pauseMessage: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    }
    participant.sendMessage(pauseMessage);
    participant.closeSocket();

    // Run: create a new connection to rejoin and send rejoin message
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message, Util.team1Name);

    // Test: scrum master 1 should have received 1 MC join + 1 MC paused + 1 MC rejoin
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Paused)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Rejoined)).toBe(1);
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.Rejoined);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.member.participantId).toBe(participant.participantId);
      expect(memberChangedMessage.data.member.status).toBe(EParticipantStatus.Connected);
    }

    // Test: participant 1 should have received a self message
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.Self)).toBe(1);

    // Test: rejoining participant should have received join messages
    expect(rejoiningParticipant.totalMessagesReceived).toBe(participant.expectedNumberOfInitialMessages);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Self, false)).toBe(1);
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.participantId).toBe(participant.participantId);
      expect(selfMessage.data.nick).toBe(Util.participant1Nick);
      expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
      expect(selfMessage.data.role).toBe(ERole.Developer);
      expect(selfMessage.data.observer).toBe(false);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.TeamName, false)).toBe(1);
    const teamMessage = rejoiningParticipant.extractMessage<ITeamNameMessage>(EServerMessageType.TeamName, false);
    if (teamMessage) {
      expect(teamMessage.data).toBe(Util.team1Name);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.CardList, false)).toBe(1);
    const cardListMessage = rejoiningParticipant.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardListMessage).toBeDefined();
    if (cardListMessage) {
      expect(cardListMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardListMessage.data.cards).toHaveLength(cohn.cards.length);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.MemberList, false)).toBe(1);
    const memberListMessage = rejoiningParticipant.extractMessage<IMemberListMessage>(EServerMessageType.MemberList, false);
    expect(memberListMessage).toBeDefined();
    if (memberListMessage) {
      expect(memberListMessage.data).toHaveLength(1);
      expect(memberListMessage.data[0].nick).toBe(Util.scrumMaster1Nick);
      expect(memberListMessage.data[0].role).toBe(ERole.ScrumMaster);
    }
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.EstimationList, false)).toBe(1);
    const estimationListMessage = rejoiningParticipant.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList, false);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(0);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2385 test('Rejoin during estimation', () => { });
});


describe('Rejoin => Failure', () => {
  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: create a new connection to rejoin and send rejoin message
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message, 'non existing team');

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have an init and an error message
    expect(rejoiningParticipant.totalMessagesReceived).toBe(2);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(rejoiningParticipant.errorMessageReceived(EErrorCode.TeamDoesNotExist)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: create a new connection to rejoin and send rejoin message
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    const message: IRejoinMessage = {
      senderId: 'unknown participant id',
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message, Util.team1Name);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have an init and an error message
    expect(rejoiningParticipant.totalMessagesReceived).toBe(2);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(rejoiningParticipant.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender already in a team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: create the second team
    Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);

    // Run: create a new connection to rejoin and send rejoin message
    const rejoiningParticipant = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have an init and an error message
    expect(rejoiningParticipant.messagesReceivedAfterInitial).toBe(1);
    expect(rejoiningParticipant.errorMessageReceived(EErrorCode.ParticipantAllReadyInTeam)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Old participant not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: create a new connection to rejoin and send rejoin message
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: 'unknown participant id',
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message, Util.team1Name);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have an init and an error message
    expect(rejoiningParticipant.totalMessagesReceived).toBe(2);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(rejoiningParticipant.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Old participant in different team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: create a second team
    Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);

    // Run: create a new connection to rejoin and send rejoin message
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message, Util.team2Name);

    // Test: scrum master 1 should have received 1 MC join + 1 MC disconnected
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: rejoining participant should have an init and an error message
    expect(rejoiningParticipant.totalMessagesReceived).toBe(2);
    expect(rejoiningParticipant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(rejoiningParticipant.errorMessageReceived(EErrorCode.ParticipantNotInTeam)).toBe(true);


    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});