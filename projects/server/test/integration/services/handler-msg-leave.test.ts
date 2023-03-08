import { describe, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberChangeType, EParticipantStatus, EServerMessageType, ILeaveMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";

describe('Leaving => OK', () => {
  test('Developer leaving', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Run: participant leaves
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    participant.sendMessage(message);
    // Run: participant closes socket
    participant.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.Left)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Developer leaving after being disconnected', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Run: participant 1 reconnects to leave
    const reconnect = Util.connectParticipant(handlerService);

    // Run: participant 1 leaves
    const message: ILeaveMessage = {
      senderId: reconnect.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    reconnect.sendMessage(message, Util.team1Name);
    reconnect.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: reconnected participant messages
    reconnect
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIs(EServerMessageType.Left)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // TODO 2385 leaving during estimations should remove estimation if participant has made one

  test('Scrum Master leaving', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Run: scrum master leaves
    const message: ILeaveMessage = {
      senderId: scrumMaster.participantId,
      data: scrumMaster.participantId,
      type: EClientMessageType.Leave
    };
    scrumMaster.sendMessage(message);

    // Run: clients will close their sockets as a reaction on the session ended message
    scrumMaster.closeSocket();
    participant.closeSocket();
    observer.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EndSession)
      .expectNoMoreMessages();

    // Test: participant should have received 1 MC join + 1 session ended
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EndSession)
      .expectNoMoreMessages();

    // Test: observer should have received 1 session ended
    observer
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EndSession)
      .expectNoMoreMessages();


    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Leaving => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: send leave message
    const message: ILeaveMessage = {
      senderId: 'some participant id',
      type: EClientMessageType.Leave,
      data: 'some participant id'
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
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with a participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: send leave message for team 2
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    participant.sendMessage(message, Util.team2Name);

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

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // Setup: connect participant
    const participant = Util.connectParticipant(handlerService);

    // Run: send leave message
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    participant.sendMessage(message, Util.team1Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender in different team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: send leave message for another team
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    participant.sendMessage(message, unaffectedTeam.teamName);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
