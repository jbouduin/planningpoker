import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EServerMessageType, IRejoinMessage } from '../../../../shared-lib/src';
import { Util } from "./util";

describe('Rejoin => OK', () => {
  test('Rejoin after disconnect', () => {
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
    const participant1Id = Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);
    // participant 2 joining team 2
    const participant2Send = jest.fn((_message: string) => Util.noop());
    const participant2Socket = Util.getSocket(participant2Send);
    Util.joinTeam(participant2Socket, handlerService, Util.team2Name, Util.participant2Nick);
    // participant 1 disconnecting
    handlerService.handleClose(participant1Socket);
    // create a new connection to rejoin
    const rejoinSend = jest.fn((_message: string) => Util.noop());
    const rejoinSocket = Util.getSocket(rejoinSend);
    const rejoiningParticipantId = handlerService.handleConnect(rejoinSocket).participantId;
    // rejoin
    const message: IRejoinMessage = {
      senderId: rejoiningParticipantId,
      data: participant1Id,
      type: EClientMessageType.Rejoin
    };
    handlerService.handleMessage(message, Util.team1Name, rejoinSocket);

    // test: scrum master 1 should have received create messages + 1 join + 1 disconnected + 1 rejoin
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.MemberChanged)).toBe(3);
    // TODO 2383 check the message contents of the rejoin

    // test: participant 1 should have received join messages
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesJoin);

    // test: rejoining participant should have received join messages
    expect(rejoinSend).toBeCalledTimes(Util.expectedMessagesJoin);

    // TODO 2383 check if the rejoin messages reflect the current team status

    // test: scrum master 1 should have received create messages + 1 join only
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMaster2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(1);

    // test: participant 2 should have received join messages only
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(0);
  });

  // TODO 2383 test('Rejoin after pause', () => { });
  // TODO 2383 test('Rejoin during estimation', () => { });
});


describe('Remove => Failure', () => {
  // TODO 2383 test('Team not found', () => { });
  // TODO 2383 test('Sender not found', () => { });
  // TODO 2383 test('Sender already in a team', () => { });
  // TODO 2383 test('Old participant not found', () => { });
  // TODO 2383 test('Old participant in different team', () => { });
});