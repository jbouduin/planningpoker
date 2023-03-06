import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { EClientMessageType, EErrorCode, EMemberChangeType, ERole, EServerMessageType, IChangeScrumMasterMessage, ISelfMessage } from '../../../../shared-lib/src';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Change scrum master => OK', () => {
  test('Change scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster= Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1= Util.joinTeam( handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: change scrum master to participant 1
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 2 MC join + 1 MC Role change + 1 Self
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.Self)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.ChangedRole)).toBe(1);
    let selfMessage = scrumMaster.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.participantId).toBe(scrumMaster.participantId);
      expect(selfMessage.data.role).toBe(ERole.Developer);
    }
    let roleChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.ChangedRole);
    expect(roleChangedMessage).toBeDefined();
    if (roleChangedMessage) {
      expect(roleChangedMessage.data.member.role).toBe(ERole.ScrumMaster);
      expect(roleChangedMessage.data.memberStatusChange).toBe(EMemberChangeType.ChangedRole);
      expect(roleChangedMessage.data.member.participantId).toBe(participant1.participantId);
    }

    // Test: participant 1 should have received 1 MC join + 1 MC role change + 1 self
    expect(participant1.messagesReceivedAfterInitial).toBe(3);
    expect(participant1.countMessagesOfType(EServerMessageType.Self)).toBe(1);
    expect(participant1.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(participant1.countMemberChangedMessages(EMemberChangeType.ChangedRole)).toBe(1);
    selfMessage = participant1.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.participantId).toBe(participant1.participantId);
      expect(selfMessage.data.role).toBe(ERole.ScrumMaster);
    }
    roleChangedMessage = participant1.extractMemberChangedMessage(EMemberChangeType.ChangedRole);
    expect(roleChangedMessage).toBeDefined();
    if (roleChangedMessage) {
      expect(roleChangedMessage.data.member.role).toBe(ERole.Developer);
      expect(roleChangedMessage.data.memberStatusChange).toBe(EMemberChangeType.ChangedRole);
      expect(roleChangedMessage.data.member.participantId).toBe(scrumMaster.participantId);
    }

    // Test: participant 2 should have received 2 MC role changes
    expect(participant2.messagesReceivedAfterInitial).toBe(2);
    expect(participant2.countMemberChangedMessages(EMemberChangeType.ChangedRole)).toBe(2);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Change scrum master => Failure', () => {
  test('New Scrum master is not connected', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: change scrum master to disconnected user
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: disconnected.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 2 MC join + 1 MC Disconnect + 1 Error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.NewScrumMasterIsNotConnected)).toBe(true);

    // Test: participant 1 should have received 1 MC join + 1 MC disconnect
    expect(participant1.messagesReceivedAfterInitial).toBe(2);
    expect(participant1.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(participant1.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);

    // Test: participant 2 should have received no messages
    expect(disconnected.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  })

  test('Sender and new scrum master in different teams', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team 1 with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: create team 2 with one participant
    Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);

    // Run: change scrum master to participant 2 who is in another team
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: participant2.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 Error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNotInTeam));

    // Test: participant 1 should have received no messages
    expect(participant1.messagesReceivedAfterInitial).toBe(0);

    // Test: participant 2 should have received no messages
    expect(participant2.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('New scrum master not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change scrum master to participant 2 who is in another team
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: 'unknown participant',
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 Error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNotFound));

    // Test: participant 1 should have received no messages
    expect(participant1.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });


  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change scrum master
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message, Util.team2Name);

    // Test: scrum master 1 should have received 1 MC join + 1 Error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.TeamDoesNotExist));

    // Test: participant 1 should have received no messages
    expect(participant1.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change scrum master
    const message: IChangeScrumMasterMessage = {
      senderId: 'unknown participant',
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 Error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: participant 1 should have received no messages
    expect(participant1.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: change scrum master
    const message: IChangeScrumMasterMessage = {
      senderId: participant2.participantId,
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };

    participant2.sendMessage(message);

    // Test: scrum master 1 should have received 2 MC join
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);

    // Test: participant 1 should have received 1 MC Join
    expect(participant1.messagesReceivedAfterInitial).toBe(1);
    expect(participant1.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);

    // Test: participant 1 should have received 1 error
    expect(participant2.messagesReceivedAfterInitial).toBe(1);
    expect(participant2.errorMessageReceived(EErrorCode.ScrumMasterRequired)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2376 test('Sender not in any team', () => { });
  // TODO 2376 test('Sender in another team', () => { });
});