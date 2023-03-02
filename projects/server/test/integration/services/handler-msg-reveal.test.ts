import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EServerMessageType, IEstimateMessage, IRevealMessage, IStartMessage } from '../../../../shared-lib/src';
import { Util } from "./util";


describe('Reveal => OK', () => {
  test('Reveal', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    const scrumMaster1ParticipantId = Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
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
    // TODO 2381 add a third participant who does not estimate
    // start estimation
    const message: IStartMessage = {
      senderId: scrumMaster1ParticipantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMaster1Socket);
    // estimate
    const estimateMessage: IEstimateMessage = {
      senderId: participant1Id,
      data: 2,
      type: EClientMessageType.Estimate
    };
    handlerService.handleMessage(estimateMessage, Util.team1Name, participant1Socket);

    const revealMessage: IRevealMessage = {
      senderId: scrumMaster1ParticipantId,
      data: undefined,
      type: EClientMessageType.Reveal
    };
    handlerService.handleMessage(revealMessage, Util.team1Name, scrumMaster1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 clear + 2 pokerstatus + 2 additional estimation list
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 6);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.EstimationList)).toBe(3);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.PokerStatus)).toBe(2);
    // TODO 2381 check the messages

    // test: participant 1 should have received join messages + 1 clear + 2 pokerstatus + 2 additional estimation list
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 5);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.EstimationList)).toBe(3);
    // TODO 2381 check the messages

    // test: scrum master 1 should have received create messages + 1 join only
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMaster2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(1);

    // test: participant 2 should have received join messages only
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(0);
  });
});


describe('Reveal => Failure', () => {
  // TODO 2381 test('team not found', () => { });
  // TODO 2381 test('Sender not found', () => { });
  // TODO 2381 test('Sender not scrum master', () => { });
  // TODO 2381 test('Sender not in any team', () => { });
  // TODO 2381 test('Sender in different team ', () => { });
  // TODO 2371 test('poker status is started', () => { });
});