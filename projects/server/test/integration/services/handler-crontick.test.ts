import { describe, expect, jest, test } from '@jest/globals';

import { EServerMessageType } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Cron tick', () => {
  test('Cron tick removes a team', async () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // create team 2
    const scrumMaster2Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster2Socket = Util.getSocket(scrumMaster2Send);
    Util.createTeam(scrumMaster2Socket, handlerService, Util.team2Name, Util.scrumMaster2Nick);
    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);
    // sleep for a second
    await Util.sleep(1000);
    // participant 2 joining team 2
    const participant2Send = jest.fn((_message: string) => Util.noop());
    const participant2Socket = Util.getSocket(participant2Send);
    Util.joinTeam(participant2Socket, handlerService, Util.team2Name, Util.participant2Nick);
    // cron tick should remove team 1 but not team 2
    handlerService.handleCronTick(50);
    // participants will close their sockets
    handlerService.handleClose(scrumMaster1Socket);
    handlerService.handleClose(participant1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 idle message
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.TeamIdle)).toBe(1);

    // test: participant 1 should have received join messages + 1 idle message
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.TeamIdle)).toBe(1);

    // test: scrum master 2 should have received create messages + 1 join only
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMaster2Send.mock.calls, EServerMessageType.TeamIdle)).toBe(0);

    // test: participant 2 should have received join messages + 1 idle message
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.TeamIdle)).toBe(0);
  });
});