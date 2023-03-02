import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { ICardService, IHandlerService } from '../../../src/services/interfaces';

import { ECardSet, EClientMessageType, EErrorCode, EParticipantStatus, ERole, EServerMessageType, ICardSetMessage, ICreatemessage, IEstimationsMessage, IMemberListMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';
import { Util } from "./util";

describe('create => OK', () => {
  test('Standard Create', () => {
    const container = Util.getContainer();
    const tshirt = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.TShirt);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Connect scrum master 1
    const send1 = jest.fn((_message: string) => Util.noop());
    const socket1 = Util.getSocket(send1);
    const participant1 = handlerService.handleConnect(socket1);
    // create team 1
    const message1: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: participant1.participantId,
      data: {
        nick: Util.scrumMaster1Nick,
        team: Util.team1Name,
        observer: false,
        cardSet: ECardSet.TShirt
      }
    }
    handlerService.handleMessage(message1, Util.team1Name, socket1);

    // check the message received by the scrum master
    expect(send1).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(send1.mock.calls, EServerMessageType.Self)).toBe(1);
    const selfMessage = Util.extractMessage<ISelfMessage>(send1.mock.calls, EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    expect(selfMessage.data.nick).toBe(Util.scrumMaster1Nick);
    expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
    expect(selfMessage.data.role).toBe(ERole.ScrumMaster);
    expect(selfMessage.data.observer).toBe(false);
    expect(Util.countMessageType(send1.mock.calls, EServerMessageType.TeamName)).toBe(1);
    const teamMessage = Util.extractMessage<ITeamNameMessage>(send1.mock.calls, EServerMessageType.TeamName);
    expect(teamMessage.data).toBe(Util.team1Name);
    expect(Util.countMessageType(send1.mock.calls, EServerMessageType.CardList)).toBe(1);
    const cardSetMessage = Util.extractMessage<ICardSetMessage>(send1.mock.calls, EServerMessageType.CardList);
    expect(cardSetMessage).toBeDefined();
    expect(cardSetMessage.data.cardSet).toBe(ECardSet.TShirt);
    expect(cardSetMessage.data.cards).toHaveLength(tshirt.cards.length);
    expect(Util.countMessageType(send1.mock.calls, EServerMessageType.MemberList)).toBe(1);
    const memberListMessage = Util.extractMessage<IMemberListMessage>(send1.mock.calls, EServerMessageType.MemberList);
    expect(memberListMessage).toBeDefined();
    expect(memberListMessage.data).toHaveLength(0);
    expect(Util.countMessageType(send1.mock.calls, EServerMessageType.EstimationList)).toBe(1);
    const estimationListMessage = Util.extractMessage<IEstimationsMessage>(send1.mock.calls, EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    expect(estimationListMessage.data).toHaveLength(0);
  });

  test('Create as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // connect scrum master 1
    const send = jest.fn((_message: string) => Util.noop());
    const socket = Util.getSocket(send);
    const participant = handlerService.handleConnect(socket);
    // create team 1
    const message: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: participant.participantId,
      data: {
        nick: Util.scrumMaster1Nick,
        team: Util.team1Name,
        observer: true,
        cardSet: ECardSet.Cohn
      }
    }
    handlerService.handleMessage(message, Util.team1Name, socket);
    // check if the observer flag was send correctly
    const selfMessage = Util.extractMessage<ISelfMessage>(send.mock.calls, EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    expect(selfMessage.data.observer).toBe(true);
  });

  test('Create with a custom card list', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // customize a card set
    const cohn = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);
    // connect the scrum master
    const send1 = jest.fn((_message: string) => Util.noop());
    const socket1 = Util.getSocket(send1);
    const participant1 = handlerService.handleConnect(socket1);
    // create the team
    const message1: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: participant1.participantId,
      data: {
        nick: Util.scrumMaster1Nick,
        team: Util.team1Name,
        observer: false,
        cardSet: ECardSet.Custom,
        cards: cohn
      }
    }
    handlerService.handleMessage(message1, Util.team1Name, socket1);
    // check if the card set message contains the correct data
    expect(send1).toBeCalledTimes(Util.expectedMessagesCreate);
    const cardSetMessage = Util.extractMessage<ICardSetMessage>(send1.mock.calls, EServerMessageType.CardList);
    expect(cardSetMessage).toBeDefined();
    expect(cardSetMessage.data.cardSet).toBe(ECardSet.Cohn);
    expect(cardSetMessage.data.cards).toHaveLength(cohn.cards.length);
  });

  test('Create a second team', () => {
    const container = Util.getContainer();
    const fibo = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // connect the first scrum master
    const send1 = jest.fn((_message: string) => Util.noop());
    const socket1 = Util.getSocket(send1);
    const scrumMaster1 = handlerService.handleConnect(socket1);
    // create team 1
    const message1: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: scrumMaster1.participantId,
      data: {
        nick: Util.scrumMaster1Nick,
        team: Util.team1Name,
        observer: false,
        cardSet: ECardSet.Cohn
      }
    }
    handlerService.handleMessage(message1, Util.team1Name, socket1);
    // connect the second scrum master
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant2 = handlerService.handleConnect(socket2);
    // create team 2
    const message2: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: participant2.participantId,
      data: {
        nick: Util.scrumMaster2Nick,
        team: Util.team2Name,
        observer: false,
        cardSet: ECardSet.Fibonacci
      }
    }
    handlerService.handleMessage(message2, Util.team2Name, socket2);

    // test: first scrum master should not have received any additional messsage
    expect(send1).toBeCalledTimes(Util.expectedMessagesCreate);

    // test: second scrum master should have received the usual create messages
    expect(send2).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.Self)).toBe(1);
    const selfMessage = Util.extractMessage<ISelfMessage>(send2.mock.calls, EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    expect(selfMessage.data.nick).toBe(Util.scrumMaster2Nick);
    expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
    expect(selfMessage.data.role).toBe(ERole.ScrumMaster);
    expect(selfMessage.data.observer).toBe(false);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.TeamName)).toBe(1);
    const teamMessage = Util.extractMessage<ITeamNameMessage>(send2.mock.calls, EServerMessageType.TeamName);
    expect(teamMessage.data).toBe(Util.team2Name);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.CardList)).toBe(1);
    const cardSetMessage = Util.extractMessage<ICardSetMessage>(send2.mock.calls, EServerMessageType.CardList);
    expect(cardSetMessage).toBeDefined();
    expect(cardSetMessage.data.cardSet).toBe(ECardSet.Fibonacci);
    expect(cardSetMessage.data.cards).toHaveLength(fibo.cards.length);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.MemberList)).toBe(1);
    const memberListMessage = Util.extractMessage<IMemberListMessage>(send2.mock.calls, EServerMessageType.MemberList);
    expect(memberListMessage).toBeDefined();
    expect(memberListMessage.data).toHaveLength(0);
    expect(Util.countMessageType(send2.mock.calls, EServerMessageType.EstimationList)).toBe(1);
    const estimationListMessage = Util.extractMessage<IEstimationsMessage>(send2.mock.calls, EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    expect(estimationListMessage.data).toHaveLength(0);
  });
});

describe('Create => Failure', () => {
  test('Team already exists', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // connect the first scrum master
    const send1 = jest.fn((_message: string) => Util.noop());
    const socket1 = Util.getSocket(send1);
    const participant1 = handlerService.handleConnect(socket1);
    // create team 1
    const message1: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: participant1.participantId,
      data: {
        nick: Util.scrumMaster1Nick,
        team: Util.team1Name,
        observer: false,
        cardSet: ECardSet.Cohn
      }
    }
    handlerService.handleMessage(message1, Util.team1Name, socket1);
    // connect the second scrum master
    const send2 = jest.fn((_message: string) => Util.noop());
    const socket2 = Util.getSocket(send2);
    const participant2 = handlerService.handleConnect(socket2);
    // create a team with the same name
    const message2: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: participant2.participantId,
      data: {
        nick: Util.scrumMaster2Nick,
        team: Util.team1Name,
        observer: false,
        cardSet: ECardSet.Fibonacci
      }
    }
    handlerService.handleMessage(message2, Util.team1Name, socket2);

    // test: scrum master 1 should not have received any additional messages
    expect(send1).toBeCalledTimes(Util.expectedMessagesCreate);

    // test: scrum master 2 should only have received the init and error message
    expect(send2).toBeCalledTimes(2);
    expect(Util.errorMessageReceived(send2.mock.calls, EErrorCode.TeamAlreadyExists)).toBe(true);
  });

  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    const send1 = jest.fn((_message: string) => Util.noop());
    const socket1 = Util.getSocket(send1);
    // create the team with an unknown participant
    const message1: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: 'some participant id',
      data: {
        nick: Util.scrumMaster1Nick,
        team: Util.team1Name,
        observer: false,
        cardSet: ECardSet.Cohn
      }
    }
    handlerService.handleMessage(message1, Util.team1Name, socket1);

    // test:  the only message received must be the error message
    expect(send1).toBeCalledTimes(1);
    expect(Util.errorMessageReceived(send1.mock.calls, EErrorCode.ParticipantNotFound)).toBe(true);
  });

  // TODO 2369 test('Send in another team', () => { }); not sure that this is realistic
  // TODO 2372 test('TeamName is empty', () => { });
  // TODO 2372 test('nick is null or empty', () => { });
  // TODO 2366 test('create with an invalid custom card set', () => { });
})