import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EMemberStatusChange, EParticipantStatus, EServerMessageType, IMemberChangedMessage, IPauseMessage, ISelfMessage } from '../../../../shared-lib/src';
import { Util } from "./helpers/util";


describe('Pause => OK', () => {
  test('pause', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    const participant1Id = Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);
    // change nick
    const message: IPauseMessage = {
      senderId: participant1Id,
      data: undefined,
      type: EClientMessageType.Pause
    };
    handlerService.handleMessage(message, Util.team1Name, participant1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 member change
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.MemberChanged)).toBe(2);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.member.status === EParticipantStatus.Paused &&
        m.data.memberStatusChange === EMemberStatusChange.Paused &&
        m.data.member.participantId === participant1Id
    )).toBe(1);

    // test: participant 1 should have received join messages + 1 additional self
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.Self)).toBe(2);
    expect(Util.countFilteredMessages<ISelfMessage>(
      participant1Send.mock.calls,
      EServerMessageType.Self,
      (m: ISelfMessage) => m.data.status === EParticipantStatus.Paused
    )).toBe(1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Pause => Failure', () => {
  // TODO 2378 test('team not found', () => { });
  // TODO 2378 test('Sender not found', () => { });
  // TODO 2378 test('Sender not in any team', () => { });
  // TODO 2378 test('Sender in different team', () => { });
  // TODO 2378 test('scrum master may not pause', () => { });
});