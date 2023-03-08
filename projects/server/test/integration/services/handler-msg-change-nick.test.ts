import { describe, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberChangeType, IChangeNickMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";


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
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsSelf({ nick: Util.observer1Name })
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.ChangedNick,
        { participantId: scrumMaster.participantId, nick: Util.observer1Name })
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Change nick => Failure', () => {
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
      data: "",
      type: EClientMessageType.ChangeNick
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 2 MC join + 1 MC disconnect + 1 error
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsError(EErrorCode.ParticipantNameMayNotBeEmpty)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: disconnected participant messages
    disconnected
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // TODO 2375 test('Team not found', () => { });
  // TODO 2375 test('Sender not found', () => { });
  // TODO 2375 test('Sender not in any team', () => { });
  // TODO 2375 test('Sender in different team', () => { });
});