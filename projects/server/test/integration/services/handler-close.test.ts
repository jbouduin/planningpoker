import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { EMemberStatusChange, ERole, EServerMessageType, IMemberChangedMessage, ISelfMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Close', () => {
  test('A participant disconnects', () => {

    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // participant 1 joining
    const participantSend = jest.fn((_message: string) => Util.noop());
    const participantSocket = Util.getSocket(participantSend);
    const participant1Id = Util.joinTeam(participantSocket, handlerService, Util.team1Name, Util.participant1Nick);
    // observer 1 joining
    const observerSend = jest.fn((_message: string) => Util.noop());
    const observerSocket = Util.getSocket(observerSend);
    Util.joinTeam(observerSocket, handlerService, Util.team1Name, Util.observer2Name);
    // participant 1 disconnects
    handlerService.handleClose(participantSocket);

    // test: scrum master should have received create messages + 2 join memberchange + 1 disconnect
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMasterSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Disconnected && participant1Id === participant1Id)
    ).toBe(1);

    // test: observer should have received join messages + 1 disconnect memberchange
    expect(observerSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      observerSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Disconnected && participant1Id === participant1Id)
    ).toBe(1);

    // test: participant should have received join messages + 1 join memberchange
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Scrum master disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    const scrumMasterId = Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining
    const participantSend = jest.fn((_message: string) => Util.noop());
    const participantSocket = Util.getSocket(participantSend);
    const participant1Id = Util.joinTeam(participantSocket, handlerService, Util.team1Name, Util.participant1Nick);
    // observer 1 joining
    const observerSend = jest.fn((_message: string) => Util.noop());
    const observerSocket = Util.getSocket(observerSend);
    const observerId = Util.joinTeam(observerSocket, handlerService, Util.team1Name, Util.observer2Name);
    // participant 1 disconnects
    handlerService.handleClose(scrumMasterSocket);

    // test: scrum master should have received create messages + 2 join memberchange
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 2);

    // test: observer should have received join messages + 1 disconnect memberchange + 1 role change or a second self
    expect(observerSend).toBeCalledTimes(Util.expectedMessagesJoin + 2);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      observerSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Disconnected && m.data.member.participantId === scrumMasterId)
    ).toBe(1);

    let secondSelfMessage = Util.extractFilteredMessage<ISelfMessage>(
      observerSend.mock.calls,
      EServerMessageType.Self,
      (m: ISelfMessage) => m.data.role === ERole.ScrumMaster && m.data.participantId == observerId);
    let otherMemberChangedRoleMessage = Util.extractFilteredMessage<IMemberChangedMessage>(
      observerSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.ChangedRole && participant1Id === participant1Id);

    if (secondSelfMessage) {
      expect(otherMemberChangedRoleMessage).toBeUndefined();
    }
    if (otherMemberChangedRoleMessage) {
      expect(secondSelfMessage).toBeUndefined();
    }

    // test: participant should have received join messages + 1 join memberchange + 1 disconnect memberchange + 1 role change or a second self
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 3);
    secondSelfMessage = Util.extractFilteredMessage<ISelfMessage>(
      participantSend.mock.calls,
      EServerMessageType.Self,
      (m: ISelfMessage) => m.data.role === ERole.ScrumMaster && m.data.participantId == observerId);
    otherMemberChangedRoleMessage = Util.extractFilteredMessage<IMemberChangedMessage>(
      participantSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.ChangedRole && participant1Id === participant1Id);

    if (secondSelfMessage) {
      expect(otherMemberChangedRoleMessage).toBeUndefined();
    }
    if (otherMemberChangedRoleMessage) {
      expect(secondSelfMessage).toBeUndefined();
    }

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('A participant that is in no team disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // participant 2 connects and disconnects
    const participant2Send = jest.fn((_message: string) => Util.noop());
    const participant2Socket = Util.getSocket(participant2Send);
    handlerService.handleConnect(participant2Socket);
    handlerService.handleClose(participant2Socket);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});