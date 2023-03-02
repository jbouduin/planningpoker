import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EMemberStatusChange, EServerMessageType, IChangeNickMessage, IMemberChangedMessage, ISelfMessage } from '../../../../shared-lib/src';
import { Util } from "./util";


describe('Change nick => OK', () => {
  test('Change nick', () => {
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
    Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);
    // participant 2 joining team 2
    const participant2Send = jest.fn((_message: string) => Util.noop());
    const participant2Socket = Util.getSocket(participant2Send);
    Util.joinTeam(participant2Socket, handlerService, Util.team2Name, Util.participant2Nick);
    // change nick
    const message: IChangeNickMessage = {
      senderId: scrumMaster1ParticipantId,
      data: Util.observer1Name,
      type: EClientMessageType.ChangeNick
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMaster1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 additional self
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.Self)).toBe(2);
    expect(Util.countFilteredMessages<ISelfMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.Self,
      (m: ISelfMessage) => m.data.nick === Util.observer1Name
    )).toBe(1);

    // test: participant 1 should have received join messages + 1 member change
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.MemberChanged)).toBe(1);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      participant1Send.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.member.nick === Util.observer1Name &&
        m.data.memberStatusChange === EMemberStatusChange.ChangedNick &&
        m.data.member.participantId === scrumMaster1ParticipantId
    )).toBe(1);

    // test: scrum master 1 should have received create messages + 1 join only
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMaster2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(1);

    // test: participant 2 should have received join messages only
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(0);
  });
});


describe('Change nick => Failure', () => {
  // TODO 2375 test('Team not found', () => { });
  // TODO 2375 test('Sender not found', () => { });
  // TODO 2375 test('Sender not in any team', () => { });
  // TODO 2375 test('Sender in different team', () => { });
  // TODO 2372 test('nick is null or empty', () => { });

});