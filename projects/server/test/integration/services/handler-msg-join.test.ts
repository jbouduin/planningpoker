import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { CardService } from 'services/implementation';
import { ECardSet, EClientMessageType, EErrorCode, EMemberStatusChange, EParticipantStatus, ERole, EServerMessageType, ICardSetMessage, IEstimationsMessage, IJoinMessage, IMemberChangedMessage, IMemberListMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';
import { Util } from "./util";


describe('Join => OK', () => {
  test('standard join', () => {
    const container = Util.getContainer();
    const cohn = container.get<CardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create the team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // connect the participant
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant = handlerService.handleConnect(socket2);
    // join the team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket2);
    // participant should have received the usual join messages
    expect(send2).toBeCalledTimes(Util.expectedMessagesJoin);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.Self)).toBe(1);
    const selfMessage = Util.extractMessage<ISelfMessage>(send2.mock.calls, EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    expect(selfMessage.data.nick).toBe(Util.participant1Nick);
    expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
    expect(selfMessage.data.role).toBe(ERole.Developer);
    expect(selfMessage.data.observer).toBe(false);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.TeamName)).toBe(1);
    const teamMessage = Util.extractMessage<ITeamNameMessage>(send2.mock.calls, EServerMessageType.TeamName);
    expect(teamMessage.data).toBe(Util.team1Name);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.CardList)).toBe(1);
    const cardSetMessage = Util.extractMessage<ICardSetMessage>(send2.mock.calls, EServerMessageType.CardList);
    expect(cardSetMessage).toBeDefined();
    expect(cardSetMessage.data.cardSet).toBe(ECardSet.Cohn);
    expect(cardSetMessage.data.cards).toHaveLength(cohn.cards.length);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.MemberList)).toBe(1);
    const memberListMessage = Util.extractMessage<IMemberListMessage>(send2.mock.calls, EServerMessageType.MemberList);
    expect(memberListMessage).toBeDefined();
    expect(memberListMessage.data).toHaveLength(1);
    expect(memberListMessage.data[0].nick).toBe(Util.scrumMaster1Nick);
    expect(memberListMessage.data[0].role).toBe(ERole.ScrumMaster);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.EstimationList)).toBe(1);
    const estimationListMessage = Util.extractMessage<IEstimationsMessage>(send2.mock.calls, EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    expect(estimationListMessage.data).toHaveLength(0);

    // scrum master should have received an additional member changed message
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMasterSend.mock.calls, EServerMessageType.MemberChanged)).toBe(1);
    const memberChangedMessage = Util.extractMessage<IMemberChangedMessage>(scrumMasterSend.mock.calls, EServerMessageType.MemberChanged);
    expect(memberChangedMessage).toBeDefined();
    expect(memberChangedMessage.data.memberStatusChange).toBe(EMemberStatusChange.Joined);
    expect(memberChangedMessage.data.member.participantId).toBe(participant.participantId);
    expect(memberChangedMessage.data.member.role).toBe(ERole.Developer);
    expect(memberChangedMessage.data.member.observer).toBe(false);
  });

  test('join as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create the team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // connect the participant
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant = handlerService.handleConnect(socket2);
    // join the team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: true,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket2);
    // check if participant received the correct value for the observer flag
    expect(send2).toBeCalledTimes(Util.expectedMessagesJoin);
    const selfMessage = Util.extractMessage<ISelfMessage>(send2.mock.calls, EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    expect(selfMessage.data.observer).toBe(true);

    // check if scrum master received the correct value for the observer flag
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    const memberChangedMessage = Util.extractMessage<IMemberChangedMessage>(scrumMasterSend.mock.calls, EServerMessageType.MemberChanged);
    expect(memberChangedMessage).toBeDefined();
    expect(memberChangedMessage.data.member.observer).toBe(true);
  });

  test('join a team with custom cardset', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // customize a card set
    const cohn = container.get<CardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);
    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // connect participant
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant = handlerService.handleConnect(socket2);
    // join team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: true,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket2);

    // check if participant received the correct card list
    expect(send2).toBeCalledTimes(Util.expectedMessagesJoin);
    const cardSetMessage = Util.extractMessage<ICardSetMessage>(scrumMasterSend.mock.calls, EServerMessageType.CardList);
    expect(cardSetMessage).toBeDefined();
    expect(cardSetMessage.data.cardSet).toBe(ECardSet.Cohn);
    expect(cardSetMessage.data.cards).toHaveLength(cohn.cards.length);
  });

  test('join a second team', () => {
    const container = Util.getContainer();
    const cohn = container.get<CardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create the first team
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // create the second team
    const scrumMaster2Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster2Socket = Util.getSocket(scrumMaster2Send);
    Util.createTeam(scrumMaster2Socket, handlerService, Util.team2Name, Util.scrumMaster2Nick);
    // connect the user
    const send3 = jest.fn((_message: string) => Util.noop());
    const socket3 = Util.getSocket(send3);
    const participant = handlerService.handleConnect(socket3);
    // join the first team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket3);
    // participant should have received the usual join messages from team 1
    expect(send3).toBeCalledTimes(Util.expectedMessagesJoin);
    expect(Util.countMessageType(send3.mock.calls, EServerMessageType.Self)).toBe(1);
    const selfMessage = Util.extractMessage<ISelfMessage>(send3.mock.calls, EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    expect(selfMessage.data.nick).toBe(Util.participant1Nick);
    expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
    expect(selfMessage.data.role).toBe(ERole.Developer);
    expect(selfMessage.data.observer).toBe(false);
    expect(Util.countMessageType(send3.mock.calls, EServerMessageType.TeamName)).toBe(1);
    const teamMessage = Util.extractMessage<ITeamNameMessage>(send3.mock.calls, EServerMessageType.TeamName);
    expect(teamMessage.data).toBe(Util.team1Name);
    expect(Util.countMessageType(send3.mock.calls, EServerMessageType.CardList)).toBe(1);
    const cardSetMessage = Util.extractMessage<ICardSetMessage>(send3.mock.calls, EServerMessageType.CardList);
    expect(cardSetMessage).toBeDefined();
    expect(cardSetMessage.data.cardSet).toBe(ECardSet.Cohn);
    expect(cardSetMessage.data.cards).toHaveLength(cohn.cards.length);
    expect(Util.countMessageType(send3.mock.calls, EServerMessageType.MemberList)).toBe(1);
    const memberListMessage = Util.extractMessage<IMemberListMessage>(send3.mock.calls, EServerMessageType.MemberList);
    expect(memberListMessage).toBeDefined();
    expect(memberListMessage.data).toHaveLength(1);
    expect(memberListMessage.data[0].nick).toBe(Util.scrumMaster1Nick);
    expect(memberListMessage.data[0].role).toBe(ERole.ScrumMaster);
    expect(Util.countMessageType(send3.mock.calls, EServerMessageType.EstimationList)).toBe(1);
    const estimationListMessage = Util.extractMessage<IEstimationsMessage>(send3.mock.calls, EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    expect(estimationListMessage.data).toHaveLength(0);

    // the scrum master of team 2 should not have received any additional messages
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    // the scrum master of team 1 should have received one additionl message
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
  });

  test('two teams with two participants', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
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
    // participant 3 joining team 1
    const participant3Send = jest.fn((_message: string) => Util.noop());
    const participant3Socket = Util.getSocket(participant3Send);
    Util.joinTeam(participant3Socket, handlerService, Util.team1Name, Util.participant3Nick);
    // participant 4 joining team 2
    const participant4Send = jest.fn((_message: string) => Util.noop());
    const participant4Socket = Util.getSocket(participant4Send);
    Util.joinTeam(participant4Socket, handlerService, Util.team2Name, Util.participant4Nick);

    // test: scrum master 1 should have received create messages + 2 joins
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    // test: scrum master 1 should have received create messages + 2 joins
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    // test: participant 1 should have received join messages + 1 join
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    // test: participant 2 should have received join messages + 1 join
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    // test: participant 3 should have received join messages
    expect(participant3Send).toBeCalledTimes(Util.expectedMessagesJoin);
    // test: participant 4 should have received join messages
    expect(participant4Send).toBeCalledTimes(Util.expectedMessagesJoin);
  });

  // TODO 2369 join a team that is currently estimating


});

describe('Join => Failure', () => {
  test('Participant does not exist', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // do not connect the user
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    // try to join
    const message: IJoinMessage = {
      senderId: 'some participant id',
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket2);
    // participant should only have received the error message
    expect(send2).toBeCalledTimes(1);
    expect(Util.errorMessageReceived(send2.mock.calls, EErrorCode.ParticipantNotFound)).toBe(true);
    // scrum master should not have received any additional messages
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate);
  });

  test('No teams exist', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // connect the user
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant = handlerService.handleConnect(socket2);
    // join a non existing team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket2);
    // participant should have received the init message and the error message
    expect(send2).toBeCalledTimes(2);
    expect(Util.errorMessageReceived(send2.mock.calls, EErrorCode.TeamDoesNotExist)).toBe(true);
  });

  test('Team does not exist', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create the team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // connect the participant
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant = handlerService.handleConnect(socket2);
    // join a non existing team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false,
        team: Util.team2Name
      }
    };
    handlerService.handleMessage(message, Util.team2Name, socket2);
    // user should only receive init and error message
    expect(send2).toBeCalledTimes(2);
    expect(Util.errorMessageReceived(send2.mock.calls, EErrorCode.TeamDoesNotExist)).toBe(true);
    // scrum master should not have received any additional messages
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate);
  });

  test('Already in the team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create the team
    const scrumMasterSend = jest.fn((_message: string) => Util.noop());
    const scrumMasterSocket = Util.getSocket(scrumMasterSend);
    Util.createTeam(scrumMasterSocket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // connect the participant
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant = handlerService.handleConnect(socket2);
    // join the team
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket2);
    // join the team a second time
    handlerService.handleMessage(message, Util.team1Name, socket2);
    // participant should have received the usual messages plus an error message
    expect(send2).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(send2.mock.calls, EErrorCode.ParticipantAllReadyInTeam)).toBe(true);
    // the scrum master should not have received a message about the second join
    expect(scrumMasterSend).toBeCalledTimes(Util.expectedMessagesCreate + 1);
  });

  test('Already in another team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team 1
    const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
    Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // create team 2
    const scrumMaster2Send = jest.fn((_message: string) => Util.noop());
    const scrumMaster2Socket = Util.getSocket(scrumMaster2Send);
    Util.createTeam(scrumMaster2Socket, handlerService, Util.team2Name, Util.scrumMaster2Nick);
    // connect user
    const send3 = jest.fn((_message: string) => Util.noop());
    const socket3 = Util.getSocket(send3);
    const participant = handlerService.handleConnect(socket3);
    // join team 1
    const message: IJoinMessage = {
      senderId: participant.participantId,
      type: EClientMessageType.Join,
      data: {
        nick: Util.participant1Nick,
        observer: false,
        team: Util.team1Name
      }
    };
    handlerService.handleMessage(message, Util.team1Name, socket3);
    // try to join team 2
    message.data.team = Util.team2Name;
    handlerService.handleMessage(message, Util.team2Name, socket3);
    // user should have received the usual join messages plus an error message when trying to join the second team
    expect(send3).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(send3.mock.calls, EErrorCode.ParticipantAllReadyInTeam)).toBe(true);
    // the scrum master of team 1 should have received the create messages plus the member change
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    // the scrum master of team 1 should only have received the create messages
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate);
  });
})