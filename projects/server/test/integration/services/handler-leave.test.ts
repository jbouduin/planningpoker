import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EMemberStatusChange, EServerMessageType, ILeaveMessage, IMemberChangedMessage } from '../../../../shared-lib/src';
import { Util } from "./util";

describe('developer leaving', () => {
  test('Standard => OK', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
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
    // participant 1 leaves
    const message: ILeaveMessage = {
      senderId: participant1Id,
      data: participant1Id,
      type: EClientMessageType.Leave
    };
    handlerService.handleMessage(message, Util.team1Name, participantSocket);
    handlerService.handleClose(participantSocket);
    // scrum master should have received create messages + 2 join memberchange + 1 leave memberchange
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMasterSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Joined)
    ).toBe(2);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMasterSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Left && participant1Id === participant1Id)
    ).toBe(1);

    // observer should have received join messages + 1 leave memberchange
    expect(observerSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      observerSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Left && participant1Id === participant1Id)
    ).toBe(1);

    // participant should have received join messages + 1 join memberchange + his own leave acknowledge message
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 2);
    expect(Util.countMessageType(participantSend.mock.calls, EServerMessageType.Left)).toBe(1);
  });

  test('leaving after being disconnected', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining
    let participantSend = jest.fn((_message: string) => Util.noop());
    let participantSocket = Util.getSocket(participantSend);
    const participant1Id = Util.joinTeam(participantSocket, handlerService, Util.team1Name, Util.participant1Nick);
    // observer 1 joining
    const observerSend = jest.fn((_message: string) => Util.noop());
    const observerSocket = Util.getSocket(observerSend);
    Util.joinTeam(observerSocket, handlerService, Util.team1Name, Util.observer2Name);
    // participant 1 disconnecting
    handlerService.handleClose(participantSocket);
    // participant 1 reconnects
    const participantReconnectSend = jest.fn((_message: string) => Util.noop());
    const participantReconnectSocket = Util.getSocket(participantReconnectSend);
    const participantReconnectedId = handlerService.handleConnect(participantReconnectSocket).participantId;
    // participant 1 leaves
    const message: ILeaveMessage = {
      senderId: participantReconnectedId,
      data: participant1Id,
      type: EClientMessageType.Leave
    };
    handlerService.handleMessage(message, Util.team1Name, participantReconnectSocket);
    handlerService.handleClose(participantReconnectSocket);

    // Test: scrum master should have received create messages + 2 join memberchange + 1 disconnected member change + 1 leave memberchange
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 4);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMasterSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Joined)
    ).toBe(2);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMasterSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Disconnected && participant1Id === participant1Id)
    ).toBe(1);
    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      scrumMasterSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Left && participant1Id === participant1Id)
    ).toBe(1);

    // Test: observer should have received join messages + 1 disconnected member change + 1 leave memberchange
    expect(observerSend).toBeCalledTimes(Util.expectedMessagesJoin + 2);
     expect(Util.countFilteredMessages<IMemberChangedMessage>(
      observerSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Disconnected && participant1Id === participant1Id)
    ).toBe(1);

    expect(Util.countFilteredMessages<IMemberChangedMessage>(
      observerSend.mock.calls,
      EServerMessageType.MemberChanged,
      (m: IMemberChangedMessage) => m.data.memberStatusChange == EMemberStatusChange.Left && participant1Id === participant1Id)
    ).toBe(1);

    // Test: reconnected participant should have received init messages + his own leave acknowledge message
    expect(participantReconnectSend).toBeCalledTimes(2);
    expect(Util.countMessageType(participantReconnectSend.mock.calls, EServerMessageType.Init)).toBe(1);
    expect(Util.countMessageType(participantReconnectSend.mock.calls, EServerMessageType.Left)).toBe(1);
  });

  // TODO 2369 leaving during estimations should remove estimation if participant has made one
});

describe('scrum master leaving', () => {
  test('Standard => OK', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    const scrumMasterId = Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant 1 joining
    const participantSend = jest.fn((_message: string) => Util.noop());
    const participantSocket = Util.getSocket(participantSend);
    Util.joinTeam(participantSocket, handlerService, Util.team1Name, Util.participant1Nick);
    // observer 1 joining
    const observerSend = jest.fn((_message: string) => Util.noop());
    const observerSocket = Util.getSocket(observerSend);
    Util.joinTeam(observerSocket, handlerService, Util.team1Name, Util.observer2Name);
    // participant 1 leaves
    const message: ILeaveMessage = {
      senderId: scrumMasterId,
      data: scrumMasterId,
      type: EClientMessageType.Leave
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMasterSocket);
    // clients will close their socket as a reaction on the session ended message
    handlerService.handleClose(scrumMasterSocket);
    handlerService.handleClose(participantSocket);
    handlerService.handleClose(observerSocket);

    // scrum master should have received create messages + 2 join memberchange + 1 session ended
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 3);
    expect(Util.countMessageType(scrumMasterSend.mock.calls, EServerMessageType.EndSession)).toBe(1);

    // observer should have received join messages + 1 session ended
    expect(observerSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.countMessageType(observerSend.mock.calls, EServerMessageType.EndSession)).toBe(1);

    // participant should have received join messages + 1 join memberchange + 1 session ended
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 2);
    expect(Util.countMessageType(participantSend.mock.calls, EServerMessageType.EndSession)).toBe(1);
  });
});
