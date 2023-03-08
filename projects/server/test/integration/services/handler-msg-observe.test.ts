import { describe, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberChangeType, IObserveMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";


describe('Toggle observe => OK', () => {
  test('Toggle own observe', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change own observer role
    const message: IObserveMessage = {
      senderId: participant.participantId,
      data: {
        member: participant.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    participant.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Observe,
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsSelf(
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Toggle observe for someone else', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: change observer role for someone else
    const message: IObserveMessage = {
      senderId: scrumMaster.participantId,
      data: {
        member: participant.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Observe,
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsSelf(
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});


describe('Toggle observe => Failure', () => {
  // TODO 2390 test('Sender not found', () => { });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change own observer role
    const message: IObserveMessage = {
      senderId: participant.participantId,
      data: {
        member: participant.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    participant.sendMessage(message, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.TeamDoesNotExist)
      .expectNoMoreMessages();

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
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: connect a participant
    const participant2 = Util.connectParticipant(handlerService);

    // Run: change own observer role
    const message: IObserveMessage = {
      senderId: participant2.participantId,
      data: {
        member: participant2.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    participant2.sendMessage(message, Util.team1Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: participant 2 messages
    participant2
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // TODO 2391 test('Sender in another team', () => { });

  test('Sender is not scrum master and changing another participant', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: change observer role for someone else
    const message: IObserveMessage = {
      senderId: participant.participantId,
      data: {
        member: scrumMaster.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    participant.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ScrumMasterRequired)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Other participant not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: change observer role for someone else
    const message: IObserveMessage = {
      senderId: scrumMaster.participantId,
      data: {
        member: Util.unknownParticipantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Other participant in different team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team 1 with participant
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: create team 2 with participant
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);

    // Setup: change observer role for someone else
    const message: IObserveMessage = {
      senderId: scrumMaster1.participantId,
      data: {
        member: participant2.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    scrumMaster1.sendMessage(message);

    // Test: scrum master 1 messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: scrum master 2 messages
    scrumMaster2
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant 2 messages
    participant2
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});