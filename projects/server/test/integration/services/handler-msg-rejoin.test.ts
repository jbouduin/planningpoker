import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, EParticipantStatus, ERole, EServerMessageType, ICardSetMessage, IEstimationListMessage, IMemberListMessage, IPauseMessage, IRejoinMessage, ITeamNameMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { IFactoryService } from '../../../src/storage/interfaces';
import STORAGETYPES from '../../../src/storage/storage.types';
import { Util } from "./helpers/util";

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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Rejoined,
        { participantId: participant.participantId, status: EParticipantStatus.Connected }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining participant messages (init sequence)
    rejoiningParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsSelf(
        {
          participantId: participant.participantId,
          role: ERole.Developer,
          observer: false,
          status: EParticipantStatus.Connected
        }
      )
      .expectNextMessageIs(EServerMessageType.TeamName, (m: ITeamNameMessage) => m.data === Util.team1Name)
      .expectNextMessageIs(
        EServerMessageType.CardList,
        (m: ICardSetMessage) => {
          expect(m.data.cardSet).toBe(ECardSet.Cohn);
          expect(m.data.cards).toHaveLength(cohn.cards.length);
        }
      )
      .expectNextMessageIs(
        EServerMessageType.MemberList,
        (m: IMemberListMessage) => {
          expect(m.data).toHaveLength(1);
          expect(m.data[0].nick).toBe(Util.scrumMaster1Nick);
          expect(m.data[0].role).toBe(ERole.ScrumMaster);
        }
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining participant messages
    rejoiningParticipant
      .initializeMessageQueue()
      .expectNextMessageIsSelf({ participantId: disconnected.participantId, role: ERole.ScrumMaster });

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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
    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining scrum master messages
    rejoiningScrumMaster
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Paused)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Rejoined,
        { participantId: participant.participantId, status: EParticipantStatus.Connected }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsSelf({ status: EParticipantStatus.Paused });

    // Test: rejoining participant messages (init sequence)
    rejoiningParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsSelf(
        {
          participantId: participant.participantId,
          role: ERole.Developer,
          observer: false,
          status: EParticipantStatus.Connected
        }
      )
      .expectNextMessageIs(EServerMessageType.TeamName, (m: ITeamNameMessage) => m.data === Util.team1Name)
      .expectNextMessageIs(
        EServerMessageType.CardList,
        (m: ICardSetMessage) => {
          expect(m.data.cardSet).toBe(ECardSet.Cohn);
          expect(m.data.cards).toHaveLength(cohn.cards.length);
        }
      )
      .expectNextMessageIs(
        EServerMessageType.MemberList,
        (m: IMemberListMessage) => {
          expect(m.data).toHaveLength(1);
          expect(m.data[0].nick).toBe(Util.scrumMaster1Nick);
          expect(m.data[0].role).toBe(ERole.ScrumMaster);
        }
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining participant messages
    rejoiningParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.TeamDoesNotExist)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining participant messages
    rejoiningParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Run: create a participant that is already in a team and send rejoin message
    const rejoiningParticipant = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    rejoiningParticipant.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining participant messages
    rejoiningParticipant
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining participant messages
    rejoiningParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: rejoining participant messages
    rejoiningParticipant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});