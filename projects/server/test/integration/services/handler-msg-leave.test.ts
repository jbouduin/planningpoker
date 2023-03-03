import { describe, expect, jest, test } from '@jest/globals';

import { EClientMessageType, EErrorCode, EMemberStatusChange, EParticipantStatus, EServerMessageType, ILeaveMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Leaving => OK', () => {
  test('Developer leaving', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant and observer
    const scrumMaster = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeamNew(handlerService, Util.team1Name, Util.observer1Name, true);

    // participant leaves
    const message: ILeaveMessage = {
      senderId: participant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    participant.sendMessage(message);
    participant.closeSocket();

    // test: scrum master should have received 2 MC join + 1 MC leave
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Left)).toBe(1);
    let leftMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // test: observer should have received 1 MC leave
    expect(observer.messagesReceivedAfterInitial).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Left)).toBe(1);
    leftMessage = observer.extractMemberChangedMessage(EMemberStatusChange.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // test: participant should have received 1 MC join memberchange + 1 Left
    expect(participant.messagesReceivedAfterInitial).toBe(2);
    expect(participant.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(participant.countMessageType(EServerMessageType.Left)).toBe(1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Developer leaving after being disconnected', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant and observer
    const scrumMaster = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeamNew(handlerService, Util.team1Name, Util.observer1Name, true);

    // participant 1 reconnects to leave
    const reconnect = Util.connectParticipant(handlerService);
    reconnect.teamName = Util.team1Name;
    // participant 1 leaves
    const message: ILeaveMessage = {
      senderId: reconnect.participantId,
      data: participant.participantId,
      type: EClientMessageType.Leave
    };
    reconnect.sendMessage(message);
    reconnect.closeSocket();

    // Test: scrum master should have received 2 MC join + 1 MC disconnected + 1 MC leave
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Left)).toBe(1);
    let leftMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: observer should have received + 1 MC disconnect + 1 MC leave
    expect(observer.messagesReceivedAfterInitial).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Left)).toBe(1);
    leftMessage = observer.extractMemberChangedMessage(EMemberStatusChange.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: participant should have received his init message
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: reconnected participant should have received init messages + his own leave acknowledge message
    expect(reconnect.countMessageType(EServerMessageType.Init, false)).toBe(1);
    expect(reconnect.countMessageType(EServerMessageType.Left, false)).toBe(1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2369 leaving during estimations should remove estimation if participant has made one

  test('Scrum Master leaving', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant and observer
    const scrumMaster = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeamNew(handlerService, Util.team1Name, Util.observer1Name, true);

    // scrum master leaves
    const message: ILeaveMessage = {
      senderId: scrumMaster.participantId,
      data: scrumMaster.participantId,
      type: EClientMessageType.Leave
    };
    scrumMaster.sendMessage(message);
    // clients will close their socket as a reaction on the session ended message
    scrumMaster.closeSocket();
    participant.closeSocket();
    observer.closeSocket();

    // test: scrum master should have received 2 MC join  + 1 session ended
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(scrumMaster.countMessageType(EServerMessageType.EndSession)).toBe(1);

    // test: participant should have received 1 MC join + 1 session ended
    expect(participant.messagesReceivedAfterInitial).toBe(2);
    expect(participant.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(participant.countMessageType(EServerMessageType.EndSession)).toBe(1);

    // test: observer should have received 1 session ended
    expect(observer.messagesReceivedAfterInitial).toBe(1);

    expect(observer.countMessageType(EServerMessageType.EndSession)).toBe(1);
    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});

describe('Leaving => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

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

    // test: participant should only have received the error message
    expect(send2).toBeCalledTimes(1);
    expect(Util.errorMessageReceived(send2.mock.calls, EErrorCode.ParticipantNotFound)).toBe(true);

    // test: scrum master should not have received any additional messages
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

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

    // test: participant should only have received the error message
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(participantSend.mock.calls, EErrorCode.TeamDoesNotExist)).toBe(true);

    // test: scrum master should not have received any additional messages
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

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

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender in different team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
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
    handlerService.handleMessage(message, unaffectedTeam.teamName, participantSocket);
    // participant should only have received the init and the error message
    expect(participantSend).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(participantSend.mock.calls, EErrorCode.ParticipantNotInTeam)).toBe(true);
    // scrum master 1 should only have received create messages and join member change
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});
