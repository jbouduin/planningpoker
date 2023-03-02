import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { ICardService, IHandlerService } from '../../../src/services/interfaces';

import { ECardSet, EClientMessageType, EServerMessageType, ICardSetMessage, IChangeCardSetMessage } from '../../../../shared-lib/src';
import { Util } from "./util";


describe('Change card set => OK', () => {
  test('Change card set', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // customize a card set
    const customizedCohn = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(9, 3);
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
    // change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster1ParticipantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    handlerService.handleMessage(message, Util.team1Name, scrumMaster1Socket);

    // test: scrum master 1 should have received create messages + 1 join + 1 additional card list
    expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 2);
    expect(Util.countMessageType(scrumMaster1Send.mock.calls, EServerMessageType.CardList)).toBe(2);
    let updatedCardSetMessage = Util.extractMessage<ICardSetMessage>(
      scrumMaster1Send.mock.calls,
      EServerMessageType.CardList,
      1
    );
    expect(updatedCardSetMessage).toBeDefined();
    expect(updatedCardSetMessage.data.cardSet).toBe(customizedCohn.cardSet);
    expect(updatedCardSetMessage.data.cards).toHaveLength(customizedCohn.cards.length);
    // test: participant 1 should have received join messages + 1 additional card list
    expect(participant1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(participant1Send.mock.calls, EServerMessageType.CardList)).toBe(2);
    updatedCardSetMessage = Util.extractMessage<ICardSetMessage>(
      participant1Send.mock.calls,
      EServerMessageType.CardList,
      1
    );
    expect(updatedCardSetMessage).toBeDefined();
    expect(updatedCardSetMessage.data.cardSet).toBe(customizedCohn.cardSet);
    expect(updatedCardSetMessage.data.cards).toHaveLength(customizedCohn.cards.length);

    // test: scrum master 2 should have received create messages + 1 join only
    expect(scrumMaster2Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
    expect(Util.countMessageType(scrumMaster2Send.mock.calls, EServerMessageType.CardList)).toBe(1);

    // test: participant 2 should have received join messages only
    expect(participant2Send).toBeCalledTimes(Util.expectedMessagesCreate);
    expect(Util.countMessageType(participant2Send.mock.calls, EServerMessageType.CardList)).toBe(1);
  });
});


describe('Change card set => Failure', () => {
  // TODO 2374 test('Team not found', () => { });
  // TODO 2374 test('Sender not found', () => { });
  // TODO 2374 test('Sender not scrum master', () => { });
  // TODO 2374 test('Sender not in any team', () => { });
  // TODO 2374 test('Sender in different team', () => { });
  // TODO 2366 test('card set invalid', () => { });

});