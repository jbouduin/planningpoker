import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EErrorCode, EMemberStatusChange, EServerMessageType, ILeaveMessage, IMemberChangedMessage } from '../../../../shared-lib/src';
import { Util } from "./util";

describe('developer leaving => OK', () => {
  test('Standard', () => {
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
    const participantSend = jest.fn((_message: string) => Util.noop());
    const participantSocket = Util.getSocket(participantSend);
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

describe('leaving => failure', () => {
  test('participant not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // do not connect the user
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    // send leave message
    const message: ILeaveMessage = {
      senderId: 'some participant id',
      type: EClientMessageType.Leave,
      data: 'some participant id'
    };
    handlerService.handleMessage(message, Util.team1Name, socket2);
    // participant should only have received the error message
    expect(send2).toBeCalledTimes(1);
    expect(Util.errorMessageReceived(send2.mock.calls, EErrorCode.ParticipantNotFound)).toBe(true);
    // scrum master should not have received any additional messages
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate);
  });

  test('team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant joins team 1
    const participantSend = jest.fn((_message: string) => Util.noop());
    const participantSocket = Util.getSocket(participantSend);
    const participantId = Util.joinTeam(participantSocket, handlerService, Util.team1Name, Util.participant1Nick);
    // send leave message for team 2
    const message: ILeaveMessage = {
      senderId: participantId,
      type: EClientMessageType.Leave,
      data: participantId
    };
    handlerService.handleMessage(message, Util.team2Name, participantSocket);
    // participant should only have received the error message
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(participantSend.mock.calls, EErrorCode.TeamDoesNotExist)).toBe(true);
    // scrum master should not have received any additional messages
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 1);
  });

  test('participant not in team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant connects
    const participantSend = jest.fn((_message: string) => Util.noop());
    const participantSocket = Util.getSocket(participantSend);
    const participantId = handlerService.handleConnect(participantSocket).participantId;
    // send leave message
    const message: ILeaveMessage = {
      senderId: participantId,
      type: EClientMessageType.Leave,
      data: participantId
    };
    handlerService.handleMessage(message, Util.team1Name, participantSocket);
    // participant should only have received the init and the error message
    expect(participantSend).toBeCalledTimes(2);
    expect(Util.errorMessageReceived(participantSend.mock.calls, EErrorCode.ParticipantNotInTeam)).toBe(true);
    // scrum master should not have received any additional messages
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate);
  });

  test('participant in another team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // create team 2
    const scrumMaster2Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster2Socket = Util.getSocket(scrumMaster2Send);
    Util.createTeam(scrumMaster2Socket, handlerService, Util.team2Name, Util.scrumMaster1Nick);
    // participant joins team 1
    const participantSend = jest.fn((_message: string) => Util.noop());
    const participantSocket = Util.getSocket(participantSend);
    const participantId = Util.joinTeam(participantSocket, handlerService, Util.team1Name, Util.participant1Nick);
    // send leave message for another team
    const message: ILeaveMessage = {
      senderId: participantId,
      type: EClientMessageType.Leave,
      data: participantId
    };
    handlerService.handleMessage(message, Util.team2Name, participantSocket);
    // participant should only have received the init and the error message
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(participantSend.mock.calls, EErrorCode.ParticipantNotInTeam)).toBe(true);
    // scrum master 1 should only have received create messages and join member change
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    // scrum master 2 should only have received create messages
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate);
  });
});
