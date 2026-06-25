import { describe, test } from '@jest/globals';
import { EParticipantChangeType, EParticipantState, EServerMessageType } from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { Util } from './helpers/util.js';

describe('Ping', () => {
  test('Handle ping', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create team with one connected, one paused participant and a connected observer
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const paused = Util.joinTeamAndPause(handlerService, Util.team1Name, Util.participant2Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer2Name, true);

    // ping
    handlerService.handlePing();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Paused)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.Ping)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Paused)
      .expectNextMessageIsMemberChange(EParticipantChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.Ping)
      .expectNoMoreMessages();

    // Test: paused participant messages
    paused.initializeMessageQueue().expectNextMessageIsSelf({ state: EParticipantState.Paused }).expectNoMoreMessages();

    // Test: observer messages
    observer.initializeMessageQueue().expectNextMessageIs(EServerMessageType.Ping).expectNoMoreMessages();
  });
});
