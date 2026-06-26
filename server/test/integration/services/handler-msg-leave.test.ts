import { describe, expect, test } from '@jest/globals';
import {
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EParticipantState,
  EServerMessageType,
  IEstimateMessage,
  IEstimationListMessage,
  ILeaveMessage,
  IStartMessage
} from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { Util } from './helpers/util.js';

describe('Leaving when connected => OK', () => {
  test('Non scrum-master Leaving ', () => {
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
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Left, {
        participantId: participant.participantId,
        state: EParticipantState.Left
      })
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Left, {
        participantId: participant.participantId,
        state: EParticipantState.Left
      })
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsSelf({ state: EParticipantState.Left })
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('leaving during estimations', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Setup: start estimating
    const startMessage: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(startMessage);

    // Setup: participant estimates
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Run: participant leaves
    const leaveMessage: ILeaveMessage = {
      senderId: participant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    participant.sendMessage(leaveMessage);
    // Run: participant closes socket
    participant.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsMemberChange(EParticipantChangeType.Left, {
        participantId: participant.participantId,
        state: EParticipantState.Left
      })
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsMemberChange(EParticipantChangeType.Left, {
        participantId: participant.participantId,
        state: EParticipantState.Left
      })
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsSelf({ state: EParticipantState.Left })
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

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
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EndSession)
      .expectNoMoreMessages();

    // Test: participant should have received 1 MC join + 1 session ended
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.EndSession)
      .expectNoMoreMessages();

    // Test: observer should have received 1 session ended
    observer.initializeMessageQueue().expectNextMessageIs(EServerMessageType.EndSession).expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Leaving after being disconnected', () => {
  test('Leaving after being disconnected', () => {
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
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Left, {
        participantId: participant.participantId,
        state: EParticipantState.Left
      })
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Left, {
        participantId: participant.participantId,
        state: EParticipantState.Left
      })
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue().expectNoMoreMessages();

    // Test: reconnected participant messages
    reconnect
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsSelf({ participantId: reconnect.participantId, state: EParticipantState.Left })
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Leaving when connected => Failure', () => {
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
      senderId: Util.unknownParticipantId,
      type: EClientMessageType.Leave,
      data: Util.unknownParticipantId
    };
    participant.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
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

    // Run: send leave message for non existing team
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    participant.sendMessage(message, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue().expectNextMessageIsError(EErrorCode.TeamNotFound).expectNoMoreMessages();

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
    scrumMaster.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Sender in another team', () => {
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
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Scrum Master can not leave during estimation', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Setup: start estimating
    const startMessage: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(startMessage);

    // Run: scrum master leaves
    const leaveMessage: ILeaveMessage = {
      senderId: scrumMaster.participantId,
      data: scrumMaster.participantId,
      type: EClientMessageType.Leave
    };
    scrumMaster.sendMessage(leaveMessage);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIsError(EErrorCode.LeaveNotAllowedDuringEstimation)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Leaving after being disconnected => Failure', () => {
  test('Sender in a team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Run: participant reconnects
    const reconnect = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: sends leave message
    const message: ILeaveMessage = {
      senderId: reconnect.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    reconnect.sendMessage(message, Util.team1Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue().expectNoMoreMessages();

    // Test: reconnected participant messages
    reconnect
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ParticipantAllReadyInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Old participant not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant and observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Run: participant reconnects to leave
    const reconnect = Util.connectParticipant(handlerService);

    // Run: participant 1 leaves
    const message: ILeaveMessage = {
      senderId: reconnect.participantId,
      data: Util.unknownParticipantId,
      type: EClientMessageType.Leave
    };
    reconnect.sendMessage(message, Util.team1Name);
    reconnect.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: observer messages
    observer.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue().expectNoMoreMessages();

    // Test: reconnected participant messages
    reconnect
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Old participant not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.connectParticipant(handlerService);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Run: participant reconnects to leave
    const reconnect = Util.connectParticipant(handlerService);
    const message: ILeaveMessage = {
      senderId: reconnect.participantId,
      type: EClientMessageType.Leave,
      data: participant.participantId
    };
    reconnect.sendMessage(message, Util.team1Name);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant.initializeMessageQueue(false).expectNextMessageIsInit().expectNoMoreMessages();

    // Test: Reconnect messages
    reconnect
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: observer messages
    observer.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Old participant in a different team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team 1
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);

    // Setup: create team 2
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);

    // Run: participant reconnects to leave
    const reconnect = Util.connectParticipant(handlerService);
    const message: ILeaveMessage = {
      senderId: reconnect.participantId,
      type: EClientMessageType.Leave,
      data: participant1.participantId
    };
    reconnect.sendMessage(message, Util.team2Name);

    // Test: scrum master 1 messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant1.initializeMessageQueue().expectNoMoreMessages();

    // Test: observer messages
    observer.initializeMessageQueue().expectNoMoreMessages();

    // Test: reconnect
    reconnect
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam);

    // Test: scrum master 2 messages
    scrumMaster2
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant 2 messages
    participant2.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
