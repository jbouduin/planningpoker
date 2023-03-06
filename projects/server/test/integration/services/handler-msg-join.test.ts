import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, EParticipantStatus, ERole, EServerMessageType, ICardSetMessage, IEstimationListMessage, IJoinMessage, IMemberListMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";
import { IFactoryService } from '../../../src/storage/interfaces';

describe('Join => OK', () => {
  test('Join', () => {
    const container = Util.getContainer();
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with particpant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Test: participant should have received the usual join messages
    expect(participant.totalMessagesReceived).toBe(participant.expectedNumberOfInitialMessages);
    expect(participant.countMessagesOfType(EServerMessageType.Self, false)).toBe(1);
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.nick).toBe(Util.participant1Nick);
      expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
      expect(selfMessage.data.role).toBe(ERole.Developer);
      expect(selfMessage.data.observer).toBe(false);
    }
    expect(participant.countMessagesOfType(EServerMessageType.TeamName, false)).toBe(1);
    const teamMessage = participant.extractMessage<ITeamNameMessage>(EServerMessageType.TeamName, false);
    if (teamMessage) {
      expect(teamMessage.data).toBe(Util.team1Name);
    }
    expect(participant.countMessagesOfType(EServerMessageType.CardList, false)).toBe(1);
    const cardListMessage = participant.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardListMessage).toBeDefined();
    if (cardListMessage) {
      expect(cardListMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardListMessage.data.cards).toHaveLength(cohn.cards.length);
    }
    expect(participant.countMessagesOfType(EServerMessageType.MemberList, false)).toBe(1);
    const memberListMessage = participant.extractMessage<IMemberListMessage>(EServerMessageType.MemberList, false);
    expect(memberListMessage).toBeDefined();
    if (memberListMessage) {
      expect(memberListMessage.data).toHaveLength(1);
      expect(memberListMessage.data[0].nick).toBe(Util.scrumMaster1Nick);
      expect(memberListMessage.data[0].role).toBe(ERole.ScrumMaster);
    }
    expect(participant.countMessagesOfType(EServerMessageType.EstimationList, false)).toBe(1);
    const estimationListMessage = participant.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList, false);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(0);
    }

    // Test: scrum master should have received 1 MC Join
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.Joined);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.memberStatusChange).toBe(EMemberChangeType.Joined);
      expect(memberChangedMessage.data.member.participantId).toBe(participant.participantId);
      expect(memberChangedMessage.data.member.role).toBe(ERole.Developer);
      expect(memberChangedMessage.data.member.observer).toBe(false);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Join as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create the team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);

    // Test:  check if participant received the correct value for the observer flag
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.observer).toBe(true);
    }

    // Test: check if scrum master received the correct value for the observer flag
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.Joined);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.member.observer).toBe(true);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Join a team wich has a custom cardset', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);

    // Setup: create team with participant and a customized cardset
    Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick, false, ECardSet.Custom, cohn);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Test: check if participant received the correct card list
    const cardListMessage = participant.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardListMessage).toBeDefined();
    if (cardListMessage) {
      expect(cardListMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardListMessage.data.cards).toHaveLength(cohn.cards.length);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Two teams with two participants', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team1Name, Util.participant2Nick);
    // Setup: create team 2 with two participants
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant3 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);
    const participant4 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);

    // Test: scrum master 1 should have received create messages + 2 MC join
    expect(scrumMaster1.totalMessagesReceived).toBe(scrumMaster1.expectedNumberOfInitialMessages + 2);
    // Test: participant 1 should have received join messages + 1 MC join
    expect(participant1.totalMessagesReceived).toBe(participant1.expectedNumberOfInitialMessages + 1);
    // Test: participant 2 should have received join messages
    expect(participant2.totalMessagesReceived).toBe(participant2.expectedNumberOfInitialMessages);

    // Test: scrum master 2 should have received create messages + 2 MC join
    expect(scrumMaster2.totalMessagesReceived).toBe(scrumMaster2.expectedNumberOfInitialMessages + 2);
    // Test: participant 3 should have received join messages + 1 MC Join
    expect(participant3.totalMessagesReceived).toBe(participant3.expectedNumberOfInitialMessages + 1);
    // Test: participant 4 should have received join messages
    expect(participant4.totalMessagesReceived).toBe(participant4.expectedNumberOfInitialMessages);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2385 test('Join a team that is currently estimating', () => { });

});

describe('Join => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.connectParticipant(handlerService);
    // Run: try to join with a wrong id
    const message: IJoinMessage = {
      senderId: 'some participant id',
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false
      }
    };
    participant.sendMessage(message, Util.team1Name);

    // Test: participant should only have received 1 Init and one error
    expect(participant.totalMessagesReceived).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: scrum master should not have received any additional messages
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Team not found - No teams exist', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: connect the user
    const participant = Util.connectParticipant(handlerService);

    // Run: try to join a non-existing team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false
      }
    };
    participant.sendMessage(message, Util.team1Name);

    // Test: participant should have received the init message and the error message
    expect(participant.totalMessagesReceived).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.TeamDoesNotExist)).toBe(true);
  });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // Setup: connect the participant
    const participant = Util.connectParticipant(handlerService);

    // Run: try to join a non-existing team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false
      }
    };
    participant.sendMessage(message, Util.team2Name);

    // Test: Participant should only receive 1 init and 1 error message
    expect(participant.totalMessagesReceived).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.TeamDoesNotExist)).toBe(true);

    // Test: Scrum master should not have received any additional messages
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender already in the team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with the participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: try to join the team again
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false
      }
    };
    participant.sendMessage(message);

    // Test: participant should have received the 1 error message
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantAllReadyInTeam)).toBe(true);

    // Test: scrum master should have received 1 MC Join
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender in another team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // Setup: create team 2
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);

    // Run: participant tries to join team 2
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false
      }
    };
    participant.sendMessage(message, Util.team2Name);

    // Test: user should have received the 1 error
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantAllReadyInTeam)).toBe(true);

    // Test: the scrum master of team 1 should have received 1 MC Join
    expect(scrumMaster1.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster1.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: scrum master 2 should not have received any message
    expect(scrumMaster2.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('User name is empty', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with particpant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, '');

    // Test: participant should have received the init and an error
    expect(participant.totalMessagesReceived).toBe(2);
    expect(participant.countMessagesOfType(EServerMessageType.Init, false)).toBe(1);
    expect(participant.errorMessageReceived(EErrorCode.ParticipantNameMayNotBeEmpty)).toBe(true);

    // Test: scrum master should have received no messages
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
})