import { describe, test } from '@jest/globals';

import { EMemberChangeType, EServerMessageType } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Cron tick', () => {
  test('Cron tick removes a team', async () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create 2 teams
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const scrumMaster2 = Util.createTeam(handlerService, Util.team2Name, Util.scrumMaster2Nick);

    // Setup: participant 1 joining team 1
    const participant1 = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: Sleep for a second
    await new Promise(r => setTimeout(r, 1000));

    // Setup: participant 2 joining team 2
    const participant2 = Util.joinTeam(handlerService, Util.team2Name, Util.participant2Nick);

    // RUN: cron tick
    handlerService.handleCronTick(50);

    // RUN: participants will close their sockets
    scrumMaster1.closeSocket();
    participant1.closeSocket();

    // Test: scrum master messages
    scrumMaster1
      .initializeMessageIterator()
      .expectNextMessageIs(EServerMessageType.MemberChanged)
      .expectNextMessageIs(EServerMessageType.TeamIdle)
      .expectNoMoreMessages();

    // Test: participant 1 messages
    participant1
      .initializeMessageIterator()
      .expectNextMessageIs(EServerMessageType.TeamIdle)
      .expectNoMoreMessages();

    // Test: scrum master 2 should have received join only
    scrumMaster2
      .initializeMessageIterator()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant 2 should have received no additional messages
    participant2
      .initializeMessageIterator()
      .expectNoMoreMessages();
  });
});