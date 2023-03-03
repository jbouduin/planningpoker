import { describe, expect, jest, test } from '@jest/globals';

import { EClientMessageType, EServerMessageType, IPauseMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Ping', () => {
  test('Handle ping', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);
    // participant 2 joining
    const participant2Send = jest.fn((_message: string) => Util.noop());
    const participant2Socket = Util.getSocket(participant2Send);
    const participant2Id = Util.joinTeam(participant2Socket, handlerService, Util.team1Name, Util.participant2Nick);
    // participant 2 pausing
    const message: IPauseMessage = {
      senderId: participant2Id,
      type: EClientMessageType.Pause,
      data: undefined
    }
    handlerService.handleMessage(message, Util.team1Name, participant2Socket);
    // observer 1 joining
    const observerSend = jest.fn((_message: string) => Util.noop());
    const observerSocket = Util.getSocket(observerSend);
    Util.joinTeam(observerSocket, handlerService, Util.team1Name, Util.observer2Name);
    // ping
    handlerService.handlePing();

    // test: scrum master should have received create messages + 3 joins + 1 pause + 1 ping
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 5);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.Ping)).toBe(1);

    // test: participant 1 should have received create messages + 2 joins + 1 pause + 1 ping
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesJoin + 4);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.Ping)).toBe(1);

    // test: participant 2 should have received create messages + 1 self (pause), no join and no ping
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.Ping)).toBe(0);

    // test: observer should have received create messages +  1 ping and no joins
    expect(observerSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.countMessageType(observerSend.mock.calls, EServerMessageType.Ping)).toBe(1);
  });
});