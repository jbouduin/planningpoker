import { describe, expect, test } from '@jest/globals';
import {
  CardSetMessageDto,
  ECardSetType,
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EParticipantState,
  ERole,
  EServerMessageType,
  EstimationDto,
  EstimationListMessageDto,
  JoinMessageDto,
  ParticipantListMessageDto,
  TeamMessageDto
} from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { IFactoryService } from '../../../src/storage/interfaces/index.js';
import STORAGETYPES from '../../../src/storage/storage.types.js';
import { TriTestFunction } from '../../types.js';
import { IATestParticipant } from './helpers/ATestParticipant.js';
import { Util } from './helpers/util.js';

describe('Join => OK', () => {
  test('Join as developer', () => {
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
      .expectNextMessageIsStartHandshake()
      .expectNextMessageIsSelf({
        participantId: participant.participantId,
        role: ERole.Developer,
        observer: false,
        state: EParticipantState.Connected
      })
      .expectNextMessageIs(EServerMessageType.Team, (m: TeamMessageDto) => expect(m.data.teamName).toBe(Util.team1Name))
      .expectNextMessageIs(EServerMessageType.CardSet, (m: CardSetMessageDto) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(cohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.ParticipantList, (m: ParticipantListMessageDto) => {
        expect(m.data).toHaveLength(1);
        expect(m.data[0].nick).toBe(Util.scrumMaster1Nick);
        expect(m.data[0].role).toBe(ERole.ScrumMaster);
      })
      .expectNextMessageIs(EServerMessageType.EndHandshake)
      .expectNextMessageIsGameStateChanged(EGameState.Cleared)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
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
      .expectNextMessageIsStartHandshake()
      .expectNextMessageIsSelf({ observer: true })
      .expectNextMessageIs(EServerMessageType.Team)
      .expectNextMessageIs(EServerMessageType.CardSet)
      .expectNextMessageIs(EServerMessageType.ParticipantList)
      .expectNextMessageIs(EServerMessageType.EndHandshake)
      .expectNextMessageIsGameStateChanged(EGameState.Cleared)
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
      .expectNextMessageIsStartHandshake()
      .expectNextMessageIsSelf()
      .expectNextMessageIs(EServerMessageType.Team)
      .expectNextMessageIs(EServerMessageType.CardSet, (m: CardSetMessageDto) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(customizedCohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.ParticipantList)
      .expectNextMessageIs(EServerMessageType.EndHandshake)
      .expectNextMessageIsGameStateChanged(EGameState.Cleared)
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

    // Setup: create the team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // Setup: validate estimationlist
    const validateEstimationListFn: TriTestFunction<Array<EstimationDto>, number | null, IATestParticipant> = (
      l: Array<EstimationDto>,
      cardIndex: number | null,
      participant: IATestParticipant
    ) => {
      expect(l).toHaveLength(1);
      expect(l[0].participantId).toBe(participant.participantId);
      if (cardIndex !== null) {
        expect(l[0].cardIndex).toBe(cardIndex);
      } else {
        expect(l[0].cardIndex).toBeNull();
      }
    };

    Util.startEstimating(scrumMaster);
    Util.estimate(scrumMaster, 2);

    // Setup: join
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.EstimationsCleared)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, 2, scrumMaster)
      )
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
      .expectNextMessageIsStartHandshake()
      .expectNextMessageIsSelf({
        participantId: participant.participantId,
        role: ERole.Developer,
        observer: false,
        state: EParticipantState.Connected
      })
      .expectNextMessageIs(EServerMessageType.Team, (m: TeamMessageDto) => expect(m.data.teamName).toBe(Util.team1Name))
      .expectNextMessageIs(EServerMessageType.CardSet, (m: CardSetMessageDto) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(cohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.ParticipantList, (m: ParticipantListMessageDto) => {
        expect(m.data).toHaveLength(1);
        expect(m.data[0].nick).toBe(Util.scrumMaster1Nick);
        expect(m.data[0].role).toBe(ERole.ScrumMaster);
      })
      .expectNextMessageIs(EServerMessageType.EndHandshake)
      .expectNextMessageIsGameStateChanged(EGameState.Started)
      .expectNextMessageIs(EServerMessageType.EstimationList, (m: EstimationListMessageDto) =>
        validateEstimationListFn(m.data, null, scrumMaster)
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
    const message: JoinMessageDto = {
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
      .expectNextMessageIsStartHandshake()
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
    const message: JoinMessageDto = {
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
      .expectNextMessageIsStartHandshake()
      .expectNextMessageIsError(EErrorCode.TeamNotFound)
      .expectNoMoreMessages();
  });

  test('Team not found - Other teams exist', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // Setup: connect the participant
    const participant = Util.connectParticipant(handlerService);

    // Run: try to join a non-existing team
    const message: JoinMessageDto = {
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
      .expectNextMessageIsStartHandshake()
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
    const message: JoinMessageDto = {
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
    // If the sender is already in the team → join is handled as rejoin
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create the team with the participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: try to join the team again
    const message: JoinMessageDto = {
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
      .expectNextMessageIsStartHandshake()
      .expectNextMessageIsError(EErrorCode.ParticipantNameMayNotBeEmpty)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
