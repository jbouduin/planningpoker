import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, ERole, EServerMessageType, ICard, ICardSet, ICardSetMessage, IChangeCardSetMessage } from '../../../../shared-lib/src';

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
    const expectCardSetFn = (c: ICardSet) => {
      expect(c.cardSet).toBe(customizedCohn.cardSet);
      expect(c.cards).toHaveLength(customizedCohn.cards.length);
    }

    // Setup: create team with a single participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(
        EServerMessageType.CardList,
        (m: ICardSetMessage) => expectCardSetFn(m.data)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIs(
        EServerMessageType.CardList,
        (m: ICardSetMessage) => expectCardSetFn(m.data)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});

describe('Change card set => Failure', () => {
  // TODO 2390 test('Sender not found', () => { });

  test('Team not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster.participantId,
      data: cohn,
      type: EClientMessageType.ChangeCardSet
    };
    scrumMaster.sendMessage(message, Util.nonExistingTeam);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.TeamDoesNotExist)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();

  });

  test('Sender not in any team', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(9, 3);

    // Setup: create team with a single participant
    const scrumMaster1 = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: connect a scrum master
    const scrumMaster2 = Util.connectParticipant(handlerService, ERole.ScrumMaster);

    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster2.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    scrumMaster2.sendMessage(message, Util.team1Name);

    // Test: scrum master 1 messages
    scrumMaster1
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: scrum master 2 messages
    scrumMaster2
      .initializeMessageQueue(false)
      .expectNextMessageIsInit()
      .expectNextMessageIsError(EErrorCode.ParticipantNotInTeam)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  // TODO 2391 test('Sender in another team', () => { });

  test('Sender not scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(9, 3);

    // Setup: create team with a single participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: participant.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    participant.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.ScrumMasterRequired)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('card set invalid: Missing unknown estimation', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set - remove the unknown estimation card
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    const indexOfUnknown = customizedCohn.cards.findIndex((card: ICard) => card.isUnknownEstimation);
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
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.UnknownEstimationCardMissing)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('card set invalid: Less than two estimation cards', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: customize a card set - remove all but one estimation card
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(1, 11);

    // Setup: create team with one participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    scrumMaster.sendMessage(message);

    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsError(EErrorCode.MoreThanTwoEstimationCardsRequired)
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});