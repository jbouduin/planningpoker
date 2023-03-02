import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EMemberStatusChange, EParticipantStatus, EServerMessageType, IMemberChangedMessage, IRemoveMessage } from '../../../../shared-lib/src';
import { Util } from "./util";


describe('Remove => OK', () => {
  test('Remove disconnected participant', () => {
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
    // participant 1 disconnecting
    handlerService.handleClose(participant1Socket);
    // participant 2 joining team 2
    const participant2Send = jest.fn((_message: string) => Util.noop());
    const participant2Socket = Util.getSocket(participant2Send);
    Util.joinTeam(participant2Socket, handlerService, Util.team2Name, Util.participant2Nick);
    // remove
    const message: IRemoveMessage = {
      senderId: scrumMaster1ParticipantId,
      data: participant1Id,
      type: EClientMessageType.Remove
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMaster1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 disconnect + 1 left
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.MemberChanged)).toBe(3);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.member.status === EParticipantStatus.Left &&
        m.data.memberStatusChange === EMemberStatusChange.Left &&
        m.data.member.participantId === participant1Id
    )).toBe(1);

    // test: participant 1 should only have received join messages
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate);

    // test: scrum master 1 should have received create messages + 1 join only
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMaster2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(1);

    // test: participant 2 should have received join messages only
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(0);
  });
});


describe('Remove => Failure', () => {
  // TODO 2379 test('Team not found', () => { });
  // TODO 2379 test('Sender not found', () => { });
  // TODO 2379 test('Sender not scrum master', () => { });
  // TODO 2379 test('Sender participant not found', () => { });
  // TODO 2379 test('Sender not in any team', () => { });
  // TODO 2379 test('Sender in different team', () => { });
  // TODO 2379 test('Sender and removed participant in different teams', () => { });
});