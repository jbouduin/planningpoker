import { describe, test } from '@jest/globals';

import { EMemberChangeType, EParticipantStatus, EServerMessageType } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from './helpers/util';

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
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Paused)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.Ping)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Paused)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.Ping)
      .expectNoMoreMessages();

    // Test: paused participant messages
    paused
      .initializeMessageQueue()
      .expectNextMessageIsSelf({ status: EParticipantStatus.Paused })
      .expectNoMoreMessages();

    // Test: observer messages
    observer.initializeMessageQueue().expectNextMessageIs(EServerMessageType.Ping).expectNoMoreMessages();
  });
});
