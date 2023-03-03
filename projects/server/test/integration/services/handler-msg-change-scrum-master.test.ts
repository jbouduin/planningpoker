import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EMemberStatusChange, ERole, EServerMessageType, IChangeScrumMasterMessage, IMemberChangedMessage, ISelfMessage } from '../../../../shared-lib/src';
import { Util } from "./helpers/util";


describe('Change scrum master => OK', () => {
  test('Change scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    const scrumMaster1ParticipantId = Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining team 1
    const participant1Send = jest.fn((_message: string) => Util.noop());
    const participant1Socket = Util.getSocket(participant1Send);
    const participant1Id = Util.joinTeam(participant1Socket, handlerService, Util.team1Name, Util.participant1Nick);
    // participant 2 joining team 1
    const participant2Send = jest.fn((_message: string) => Util.noop());
    const participant2Socket = Util.getSocket(participant2Send);
    Util.joinTeam(participant2Socket, handlerService, Util.team1Name, Util.participant2Nick);

    // change scrum master
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster1ParticipantId,
      data: participant1Id,
      type: EClientMessageType.ChangeScrumMaster
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMaster1Socket);

    // test: scrum master 1 should have received create messages + 2 joins + 1 role change + 1 additional self
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 4);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.Self)).toBe(2);
    expect(Util.countFilteredMessages<ISelfMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.Self,
      (m: ISelfMessage) => m.data.role === ERole.Developer
    )).toBe(1);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.MemberChanged)).toBe(3);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.member.role === ERole.ScrumMaster &&
        m.data.memberStatusChange === EMemberStatusChange.ChangedRole &&
        m.data.member.participantId === participant1Id
    )).toBe(1);

    // test: participant 1 should have received join messages + 1 join + 1 role change + 1 self
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.Self)).toBe(2);
    expect(Util.countFilteredMessages<ISelfMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.Self,
      (m: ISelfMessage) => m.data.role === ERole.ScrumMaster
    )).toBe(1);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.MemberChanged)).toBe(2);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      participant1Send.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.member.role === ERole.Developer &&
        m.data.memberStatusChange === EMemberStatusChange.ChangedRole &&
        m.data.member.participantId === scrumMaster1ParticipantId
    )).toBe(1);

    // test: participant 2 should have received join messages + 2 role changes
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.MemberChanged)).toBe(2);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Change scrum master => Failure', () => {
  // TODO 2376 test('Team not found', () => { });
  // TODO 2376 test('Sender not found', () => { });
  // TODO 2376 test('Sender not scrum master', () => { });
  // TODO 2376 test('Sender not in any team', () => { });
  // TODO 2376 test('Sender in another team', () => { });
  // TODO 2376 test('New scrum master not found', () => { });
  // TODO 2373 test('New Scrum master is not connected', () => {})
  // TODO 2373 test('Sender and new scrum master in different teams', () => { });
});