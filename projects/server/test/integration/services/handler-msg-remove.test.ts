import { describe, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberChangeType, EParticipantStatus, ERole, IRemoveMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";


describe('Remove => OK', () => {
  test('Remove participant', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster= Util.createTeam( handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);
    const participant = Util.joinTeamAndDisconnect( handlerService, Util.team1Name, Util.participant1Nick);

    // Run: remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: scrumMaster.participantId,
      data: participant.participantId,
      type: EClientMessageType.Remove
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});


describe('Remove => Failure', () => {
  // TODO 2390 test('Sender not found', () => { });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: scrumMaster.participantId,
      data: participant.participantId,
      type: EClientMessageType.Remove
    };
    scrumMaster.sendMessage(message, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.TeamNotFound)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: connect a second scrum master
    const scrumMaster2 = Util.connectParticipant(handlerService, ERole.ScrumMaster);

    // Run: remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: scrumMaster2.participantId,
      data: participant.participantId,
      type: EClientMessageType.Remove
    };
    scrumMaster2.sendMessage(message, Util.team1Name);

    // Test: scrum master messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: scrum master 2 messages
    scrumMaster2
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam);

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // TODO 2390 test('Sender in another team', () => { });

  test('Sender not scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: observer.participantId,
      data: participant.participantId,
      type: EClientMessageType.Remove
    };
    observer.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsError(EErrorCode.ScrumMasterRequired)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Removed participant not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: scrumMaster.participantId,
      data: Util.unknownParticipantId,
      type: EClientMessageType.Remove
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender and removed participant in different teams', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);
    const participant1 = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: create team 2
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant2 = Util.joinTeamAndDisconnect(handlerService, Util.team2Name, Util.participant2Nick);

    // Run: remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: scrumMaster1.participantId,
      data: participant2.participantId,
      type: EClientMessageType.Remove
    };
    scrumMaster1.sendMessage(message);

    // Test: scrum master 1 messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: scrum master 2 messages
    scrumMaster2
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant 2 messages
    participant2
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
   });
});