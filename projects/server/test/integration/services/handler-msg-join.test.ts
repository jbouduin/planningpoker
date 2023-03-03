import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { CardService } from 'services/implementation';
import { ECardSet, EClientMessageType, EErrorCode, EMemberStatusChange, EParticipantStatus, ERole, EServerMessageType, ICardSetMessage, IEstimationsMessage, IJoinMessage, IMemberChangedMessage, IMemberListMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';
import { Util } from "./helpers/util";


describe('Join => OK', () => {
  test('Join', () => {
    const container = Util.getContainer();
    const cohn = container.get<CardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create the team with particpant
    const scrumMaster = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);

    // test: participant should have received the usual join messages
    expect(participant.totalMessagesReceived).toBe(participant.expectedNumberOfInitialMessages);
    expect(participant.countMessageType(EServerMessageType.Self, false)).toBe(1);
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.nick).toBe(Util.participant1Nick);
      expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
      expect(selfMessage.data.role).toBe(ERole.Developer);
      expect(selfMessage.data.observer).toBe(false);
    }
    expect(participant.countMessageType(EServerMessageType.TeamName, false)).toBe(1);
    const teamMessage = participant.extractMessage<ITeamNameMessage>(EServerMessageType.TeamName, false);
    if (teamMessage) {
      expect(teamMessage.data).toBe(Util.team1Name);
    }
    expect(participant.countMessageType(EServerMessageType.CardList, false)).toBe(1);
    const cardListMessage = participant.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardListMessage).toBeDefined();
    if (cardListMessage) {
      expect(cardListMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardListMessage.data.cards).toHaveLength(cohn.cards.length);
    }
    expect(participant.countMessageType(EServerMessageType.MemberList, false)).toBe(1);
    const memberListMessage = participant.extractMessage<IMemberListMessage>(EServerMessageType.MemberList, false);
    expect(memberListMessage).toBeDefined();
    if (memberListMessage) {
      expect(memberListMessage.data).toHaveLength(1);
      expect(memberListMessage.data[0].nick).toBe(Util.scrumMaster1Nick);
      expect(memberListMessage.data[0].role).toBe(ERole.ScrumMaster);
    }
    expect(participant.countMessageType(EServerMessageType.EstimationList, false)).toBe(1);
    const estimationListMessage = participant.extractMessage<IEstimationsMessage>(EServerMessageType.EstimationList, false);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(0);
    }

    // test: scrum master should have received 1 MC Join
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Joined);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.memberStatusChange).toBe(EMemberStatusChange.Joined);
      expect(memberChangedMessage.data.member.participantId).toBe(participant.participantId);
      expect(memberChangedMessage.data.member.role).toBe(ERole.Developer);
      expect(memberChangedMessage.data.member.observer).toBe(false);
    }

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Join as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create the team
    const scrumMaster = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick, true);

    // test:  check if participant received the correct value for the observer flag
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.observer).toBe(true);
    }

    // test: check if scrum master received the correct value for the observer flag
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Joined);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.member.observer).toBe(true);
    }

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Join a team wich has a custom cardset', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // customize a card set
    const cohn = container.get<CardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);
    // create team with participant and a customized cardset
    Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick, false, ECardSet.Cohn, cohn);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);

    // test: check if participant received the correct card list
    const cardListMessage = participant.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardListMessage).toBeDefined();
    if (cardListMessage) {
      expect(cardListMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardListMessage.data.cards).toHaveLength(cohn.cards.length);
    }

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Two teams with two participants', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with two participants
    const scrumMaster1 = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1 = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant2Nick);
    // create team 2 with two participants
    const scrumMaster2 = Util.createTeamNew(handlerService, Util.team2Name, Util.scrumMaster2Nick);
    const participant3 = Util.joinTeamNew(handlerService, Util.team2Name, Util.participant2Nick);
    const participant4 = Util.joinTeamNew(handlerService, Util.team2Name, Util.participant2Nick);

    // test: scrum master 1 should have received create messages + 2 MC join
    expect(scrumMaster1.totalMessagesReceived).toBe(scrumMaster1.expectedNumberOfInitialMessages + 2);
    // test: participant 1 should have received join messages + 1 MC join
    expect(participant1.totalMessagesReceived).toBe(participant1.expectedNumberOfInitialMessages + 1);
    // test: participant 2 should have received join messages
    expect(participant2.totalMessagesReceived).toBe(participant2.expectedNumberOfInitialMessages);

    // test: scrum master 2 should have received create messages + 2 MC join
    expect(scrumMaster2.totalMessagesReceived).toBe(scrumMaster2.expectedNumberOfInitialMessages + 2);
    // test: participant 3 should have received join messages + 1 MC Join
    expect(participant3.totalMessagesReceived).toBe(participant3.expectedNumberOfInitialMessages + 1);
    // test: participant 4 should have received join messages
    expect(participant4.totalMessagesReceived).toBe(participant4.expectedNumberOfInitialMessages);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2369 test('Join a team that is currently estimating', () => { });

});

describe('Join => Failure', () => {
  test('Sender does not exist', () => {
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

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
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

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

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

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender already in the team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

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
    handlerService.handleMessage(message, unaffectedTeam.teamName, socket3);
    // user should have received the usual join messages plus an error message when trying to join the second team
    expect(send3).toBeCalledTimes(Util.expectedMessagesJoin + 1);
    expect(Util.errorMessageReceived(send3.mock.calls, EErrorCode.ParticipantAllReadyInTeam)).toBe(true);
    // the scrum master of team 1 should have received the create messages plus the member change
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
})