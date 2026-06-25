import { describe, test } from '@jest/globals';
import { EClientMessageType, EErrorCode, EParticipantChangeType, IChangeNickMessage } from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { Util } from './helpers/util.js';

describe('Change nick => OK', () => {
  test('Change nick', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one connected and one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: scrum master changes his nick
    const message: IChangeNickMessage = {
      senderId: scrumMaster.participantId,
      data: Util.observer1Name,
      type: EClientMessageType.ChangeNick
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 2 MC join + 1 MC disconnect + 1 self
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsSelf({ nick: Util.observer1Name })
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsMemberChange(EParticipantChangeType.ChangedNick, {
        participantId: scrumMaster.participantId,
        nick: Util.observer1Name
      })
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Change nick => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one connected and one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: scrum master changes his nick
    const message: IChangeNickMessage = {
      senderId: Util.unknownParticipantId,
      data: Util.scrumMaster2Nick,
      type: EClientMessageType.ChangeNick
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // test not required for "Team not found"
  // test not required for "Sender not in any team"
  // test not required for "Sender in another team"

  test('nick is null or empty', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one connected and one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick);

    // Run: scrum master changes his nick
    const message: IChangeNickMessage = {
      senderId: scrumMaster.participantId,
      data: '',
      type: EClientMessageType.ChangeNick
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNextMessageIsError(EErrorCode.ParticipantNameMayNotBeEmpty)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected.initializeMessageQueue().expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
