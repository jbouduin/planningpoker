import { describe, test } from '@jest/globals';

import {
  EClientMessageType,
  EErrorCode,
  EMemberChangeType,
  ERole,
  IChangeScrumMasterMessage
} from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from './helpers/util';

describe('Change scrum master => OK', () => {
  test('Change scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: change scrum master to participant 1
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.ChangedRole, {
        participantId: participant1.participantId,
        role: ERole.ScrumMaster
      })
      .expectNextMessageIsSelf({ role: ERole.Developer })
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.ChangedRole, {
        participantId: scrumMaster.participantId,
        role: ERole.Developer
      })
      .expectNextMessageIsSelf({ role: ERole.ScrumMaster })
      .expectNoMoreMessages();

    // Test: participant 2 messages
    participant2
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.ChangedRole, {
        participantId: scrumMaster.participantId,
        role: ERole.Developer
      })
      .expectNextMessageIsMemberChange(EMemberChangeType.ChangedRole, {
        participantId: participant1.participantId,
        role: ERole.ScrumMaster
      })
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Change scrum master => Failure', () => {
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
      senderId: Util.unknownParticipantId,
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1.initializeMessageQueue().expectNoMoreMessages();

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

    // Run: change scrum master
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: participant.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.TeamNotFound)
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue().expectNoMoreMessages();

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
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: connect a scrum master
    const scrumMaster2 = Util.connectParticipant(handlerService, ERole.ScrumMaster);

    // Run: change scrum master to participant 1
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster2.participantId,
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster2.sendMessage(message, Util.team1Name);

    // Test: scrum master messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1.initializeMessageQueue().expectNoMoreMessages();

    // Test: scrum master 2 messages
    scrumMaster2
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // TODO 2391 test('Sender in another team', () => { });

  test('New Scrum master is not connected', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with a connected and a disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: change scrum master to disconnected user
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: disconnected.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsError(EErrorCode.NewScrumMasterIsNotConnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant 2 messages
    participant2.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('New scrum master not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change scrum master to unknown participant
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: 'unknown participant',
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant 2 should have received 1 error
    participant2
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ScrumMasterRequired)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
