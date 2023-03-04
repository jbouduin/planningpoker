import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, EServerMessageType, ICard, ICardSetMessage, IChangeCardSetMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { IFactoryService } from '../../../src/storage/interfaces';
import { Util } from "./helpers/util";

describe('Change card set => OK', () => {
  test('Change card set', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(9, 3);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // Setup: participant joining team 1
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 1 MC join + 1 card list
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.CardList)).toBe(1);
    let updatedCardSetMessage = scrumMaster.extractMessage<ICardSetMessage>(EServerMessageType.CardList);
    expect(updatedCardSetMessage).toBeDefined();
    if (updatedCardSetMessage) {
      expect(updatedCardSetMessage.data.cardSet).toBe(customizedCohn.cardSet);
      expect(updatedCardSetMessage.data.cards).toHaveLength(customizedCohn.cards.length);
    }

    // Test: participant should have received card list message only
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.CardList)).toBe(1);
    updatedCardSetMessage = participant.extractMessage<ICardSetMessage>(EServerMessageType.CardList);
    expect(updatedCardSetMessage).toBeDefined();
    if (updatedCardSetMessage) {
      expect(updatedCardSetMessage.data.cardSet).toBe(customizedCohn.cardSet);
      expect(updatedCardSetMessage.data.cards).toHaveLength(customizedCohn.cards.length);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Change card set => Failure', () => {
  // TODO 2374 test('Team not found', () => { });
  // TODO 2374 test('Sender not found', () => { });
  // TODO 2374 test('Sender not scrum master', () => { });
  // TODO 2374 test('Sender not in any team', () => { });
  // TODO 2374 test('Sender in different team', () => { });

  test('card set invalid: Missing unknown estimation', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    const indexOfUnknown = customizedCohn.cards.findIndex((card: ICard) => card.index === customizedCohn.unknownEstimationIndex);
    customizedCohn.cards.splice(indexOfUnknown, 1);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // Setup: participant joining team 1
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 1 MC join + 1 error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.UnknownEstimationCardMissing)).toBe(true);

    // Test: participant should have received no messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('card set invalid: Less than two estimation cards', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(1, 11);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // Setup: participant joining team 1
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 1 MC join + 1 error
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.MoreThanTwoEstimationCardsRequired)).toBe(true);

    // Test: participant should have received no messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});