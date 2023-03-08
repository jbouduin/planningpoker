import { describe, expect, test } from '@jest/globals';

import { EMemberChangeType, EParticipantStatus, EServerMessageType } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

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
      .initializeMessageIterator()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Paused)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.Ping)
      .expectNoMoreMessages();


    // Test: participant messages
    participant
      .initializeMessageIterator()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Paused)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.Ping)
      .expectNoMoreMessages();

    // Test: paused participant messages
    paused
      .initializeMessageIterator()
      .expectNextMessageIsSelf({status: EParticipantStatus.Paused})
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageIterator()
      .expectNextMessageIs(EServerMessageType.Ping)
      .expectNoMoreMessages();
  });
});