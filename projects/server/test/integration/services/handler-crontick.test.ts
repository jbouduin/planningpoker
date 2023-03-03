import { describe, expect, test } from '@jest/globals';

import { EMemberStatusChange, EServerMessageType } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Cron tick', () => {
  test('Cron tick removes a team', async () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create teams
    const scrumMaster1 = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const scrumMaster2 = Util.createTeamNew(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    // participant 1 joining team 1
    const participant1 = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    // sleep for a second
    await new Promise(r => setTimeout(r, 1000));
    // participant 2 joining team 2
    const participant2 = Util.joinTeamNew(handlerService, Util.team2Name, Util.participant2Nick);
    // cron tick should remove team 1 but not team 2
    handlerService.handleCronTick(50);
    // participants will close their sockets as they receive the idle message
    handlerService.handleClose(scrumMaster1.socket);
    handlerService.handleClose(participant1.socket);

    // test: scrum master 1 should have received 1 MC join + 1 idle message
    expect(scrumMaster1.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster1.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(scrumMaster1.countMessageType(EServerMessageType.TeamIdle)).toBe(1);

    // test: participant 1 should have received idle message only
    expect(participant1.messagesReceivedAfterInitial).toBe(1);
    expect(participant1.countMessageType(EServerMessageType.TeamIdle)).toBe(1);

    // test: scrum master 2 should have received join only
    expect(scrumMaster2.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster2.countMessageType(EServerMessageType.TeamIdle)).toBe(0);

    // test: participant 2 should have received no additional messages
    expect(participant2.messagesReceivedAfterInitial).toBe(0);
    expect(participant2.countMessageType(EServerMessageType.TeamIdle)).toBe(0);
  });
});