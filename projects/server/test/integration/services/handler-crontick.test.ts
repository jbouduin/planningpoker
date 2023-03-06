import { describe, expect, test } from '@jest/globals';

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

    // Test: scrum master 1 should have received 1 MC join + 1 idle message
    expect(scrumMaster1.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster1.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster1.countMessagesOfType(EServerMessageType.TeamIdle)).toBe(1);

    // Test: participant 1 should have received idle message only
    expect(participant1.messagesReceivedAfterInitial).toBe(1);
    expect(participant1.countMessagesOfType(EServerMessageType.TeamIdle)).toBe(1);

    // Test: scrum master 2 should have received join only
    expect(scrumMaster2.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster2.countMessagesOfType(EServerMessageType.TeamIdle)).toBe(0);

    // Test: participant 2 should have received no additional messages
    expect(participant2.messagesReceivedAfterInitial).toBe(0);
    expect(participant2.countMessagesOfType(EServerMessageType.TeamIdle)).toBe(0);
  });
});