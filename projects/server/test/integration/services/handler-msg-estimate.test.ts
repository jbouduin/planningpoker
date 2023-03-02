import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EServerMessageType, IEstimateMessage, IEstimationsMessage, IStartMessage } from '../../../../shared-lib/src';
import { Util } from "./util";


describe('Estimate => OK', () => {
  test('Give estimation', () => {
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

    // test: scrum master 1 should have received create messages + 1 join + 1 clear + 1 pokerstatus + 1 additional estimation list
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 4);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.EstimationList)).toBe(2);
    expect(Util.countFilteredMessages<IEstimationsMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.EstimationList,
      (m: IEstimationsMessage) => m.data.length === 1 &&
        m.data[0].participantId === participant1Id &&
        // TODO 2383 remove 999 to indicate that we do not want to send the estimated value
        m.data[0].cardIndex === 999 &&
        m.data[0].revealed === false
    )).toBe(1);

    // test: participant 1 should have received join messages + 1 clear + 1 pokerstatus + 1 additional estimation list
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.EstimationList)).toBe(2);
    expect(Util.countFilteredMessages<IEstimationsMessage>(
      participant1Send.mock.calls,
      EServerMessageType.EstimationList,
      (m: IEstimationsMessage) => m.data.length === 1 &&
        m.data[0].participantId === participant1Id &&
        m.data[0].cardIndex === 2 &&
        m.data[0].revealed === true
    )).toBe(1);

    // test: scrum master 1 should have received create messages + 1 join only
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMaster2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(1);

    // test: participant 2 should have received join messages only
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(0);
  });

  // TODO 2380 test('Withdraw estimation', () => { });
  // TODO 2380 test('Update estimation', () => { });
});


describe('Estimate => Failure', () => {
  // TODO 2380 test('Team not found', () => { });
  // TODO 2380 test('Sender not found', () => { });
  // TODO 2380 test('Sender not in any team', () => { });
  // TODO 2380 test('Sender in different team', () => { });
  // TODO 2371 test('poker status is not started', () => { });
  // TODO 2380 test('Sender is observer', () => { });
  // TODO 2380 test('Card index out of range', () => { });
});