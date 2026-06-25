import { describe, expect, test } from '@jest/globals';
import {
  ECardSetType,
  EClientMessageType,
  EErrorCode,
  EParticipantChangeType,
  EParticipantState,
  ERole,
  EServerMessageType,
  ICardSetMessage,
  IEstimationListMessage,
  IJoinMessage,
  IParticipantListMessage,
  ITeamNameMessage
} from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { IFactoryService } from '../../../src/storage/interfaces/index.js';
import STORAGETYPES from '../../../src/storage/storage.types.js';
import { Util } from './helpers/util.js';

describe('Join => OK', () => {
  test('Join', () => {
    const container = Util.getContainer();
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.Cohn);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with particpant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, {
        participantId: participant.participantId,
        role: ERole.Developer,
        observer: false,
        state: EParticipantState.Connected
      })
      .expectNoMoreMessages();

    // Test: participant messages (init sequence)
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsSelf({
        participantId: participant.participantId,
        role: ERole.Developer,
        observer: false,
        state: EParticipantState.Connected
      })
      .expectNextMessageIs(EServerMessageType.TeamName, (m: ITeamNameMessage) => m.data === Util.team1Name)
      .expectNextMessageIs(EServerMessageType.CardSet, (m: ICardSetMessage) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(cohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.MemberList, (m: IParticipantListMessage) => {
        expect(m.data).toHaveLength(1);
        expect(m.data[0].nick).toBe(Util.scrumMaster1Nick);
        expect(m.data[0].role).toBe(ERole.ScrumMaster);
      })
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Join as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create the team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);

    // Test: scrum master messages - observer flag should be set
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, { observer: true })
      .expectNoMoreMessages();

    // Test: participant messages (init sequence) - observer flag should be set
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsSelf({ observer: true })
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(EServerMessageType.CardSet)
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIs(EServerMessageType.EstimationList)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Join a team wich has a custom cardset', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.Cohn);
    customizedCohn.cards.splice(9, 3);

    // Setup: create team with participant and a customized cardset
    Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick, false, ECardSetType.Custom, customizedCohn);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Test: participant messages (init sequence) - check card list
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsSelf()
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(EServerMessageType.CardSet, (m: ICardSetMessage) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(customizedCohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIs(EServerMessageType.EstimationList)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Two teams with two participants', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team 1 with two participants
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeam(handlerService, Util.team1Name, Util.participant2Nick);
    // Setup: create team 2 with two participants
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant3 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);
    const participant4 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);

    // Test: scrum master 1 messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, { participantId: participant1.participantId })
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, { participantId: participant2.participantId })
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, { participantId: participant2.participantId })
      .expectNoMoreMessages();

    // Test: participant 2 messages
    participant2.initializeMessageQueue().expectNoMoreMessages();

    // Test: scrum master 2 should have received create messages + 2 MC join
    scrumMaster2
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, { participantId: participant3.participantId })
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, { participantId: participant4.participantId })
      .expectNoMoreMessages();

    // Test: participant 3 messages
    participant3
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, { participantId: participant4.participantId })
      .expectNoMoreMessages();

    // Test: participant 4 messages
    participant4.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Join a team that is estimating', () => {
    const container = Util.getContainer();
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.Cohn);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined, {
        participantId: participant.participantId,
        role: ERole.Developer,
        observer: false,
        state: EParticipantState.Connected
      })
      .expectNoMoreMessages();

    // Test: participant messages (init sequence)
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsSelf({
        participantId: participant.participantId,
        role: ERole.Developer,
        observer: false,
        state: EParticipantState.Connected
      })
      .expectNextMessageIs(EServerMessageType.TeamName, (m: ITeamNameMessage) => m.data === Util.team1Name)
      .expectNextMessageIs(EServerMessageType.CardSet, (m: ICardSetMessage) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(cohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.MemberList, (m: IParticipantListMessage) => {
        expect(m.data).toHaveLength(1);
        expect(m.data[0].nick).toBe(Util.scrumMaster1Nick);
        expect(m.data[0].role).toBe(ERole.ScrumMaster);
      })
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: IEstimationListMessage) =>
        expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
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

    // Test: scrum master messages
    scrumMaster.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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
    participant.sendMessage(message, Util.nonExistingTeam);

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.TeamNotFound)
      .expectNoMoreMessages();
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
    participant.sendMessage(message, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.TeamNotFound)
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

    // Test: scrum master 1 messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: scrum master 2 messages
    scrumMaster2.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ParticipantAllReadyInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ParticipantAllReadyInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('User name is empty', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with particpant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, '');

    // Test: scrum master messages
    scrumMaster.initializeMessageQueue().expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNameMayNotBeEmpty)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
