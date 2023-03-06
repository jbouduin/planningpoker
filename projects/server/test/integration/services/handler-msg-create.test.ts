import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EParticipantStatus, ERole, EServerMessageType, ICard, ICardSetMessage, ICreatemessage, IEstimationListMessage, IMemberListMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { IFactoryService } from '../../../src/storage/interfaces';
import { ITestScrumMaster } from './helpers/TestScrumMaster';
import { Util } from "./helpers/util";

describe('create => OK', () => {
  test('Standard Create', () => {
    const container = Util.getContainer();
    const tshirt = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.TShirt);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Create team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, false, ECardSet.TShirt);

    // Test: check the initial messages received by the scrum master
    expect(scrumMaster.messagesReceivedAsExpected(Util.createMessageTypesExpected, false)).toBe(true);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.Self, false)).toBe(1);
    const selfMessage = scrumMaster.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.nick).toBe(Util.scrumMaster1Nick);
      expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
      expect(selfMessage.data.role).toBe(ERole.ScrumMaster);
      expect(selfMessage.data.observer).toBe(false);
    }
    expect(scrumMaster.countMessagesOfType(EServerMessageType.TeamName, false)).toBe(1);
    const teamMessage = scrumMaster.extractMessage<ITeamNameMessage>(EServerMessageType.TeamName, false);
    if (teamMessage) {
      expect(teamMessage.data).toBe(Util.team1Name);
    }
    expect(scrumMaster.countMessagesOfType(EServerMessageType.CardList, false)).toBe(1);
    const cardSetMessage = scrumMaster.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardSetMessage).toBeDefined();
    if (cardSetMessage) {
      expect(cardSetMessage.data.cardSet).toBe(ECardSet.TShirt);
      expect(cardSetMessage.data.cards).toHaveLength(tshirt.cards.length);
    }
    expect(scrumMaster.countMessagesOfType(EServerMessageType.MemberList, false)).toBe(1);
    const memberListMessage = scrumMaster.extractMessage<IMemberListMessage>(EServerMessageType.MemberList, false);
    expect(memberListMessage).toBeDefined();
    if (memberListMessage) {
      expect(memberListMessage.data).toHaveLength(0);
    }
    expect(scrumMaster.countMessagesOfType(EServerMessageType.EstimationList, false)).toBe(1);
    const estimationListMessage = scrumMaster.extractMessage<IEstimationListMessage>(EServerMessageType.EstimationList, false);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(0);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Create as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.TShirt);

    // Test: check if the observer flag was send correctly
    expect(scrumMaster.messagesReceivedAsExpected(Util.createMessageTypesExpected, false)).toBe(true);
    const selfMessage = scrumMaster.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.observer).toBe(true);
    }
  });

  test('Create with a custom card list', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: customize a card set
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.Custom, cohn);

    // Test: check if the card set message contains the correct data
    const cardSetMessage = scrumMaster.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardSetMessage).toBeDefined();
    if (cardSetMessage) {
      expect(cardSetMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardSetMessage.data.cards).toHaveLength(cohn.cards.length);
    }
  });

  test('Create with a custom card list without cards', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: get Cohn set for testing afterwards
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.Custom, undefined);

    // Test: check if the card set message contains the correct data
    expect(scrumMaster.messagesReceivedAsExpected(Util.createMessageTypesExpected, false)).toBe(true);
    const cardSetMessage = scrumMaster.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardSetMessage).toBeDefined();
    if (cardSetMessage) {
      expect(cardSetMessage.data.cardSet).toBe(ECardSet.Cohn);
      expect(cardSetMessage.data.cards).toHaveLength(cohn.cards.length);
    }
  });
});

describe('Create => Failure', () => {
  test('Team already exists', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Try to recreate the unaffected team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, unaffectedTeam.teamName, Util.scrumMaster1Nick, false, ECardSet.TShirt);

    // Test: scrum master should only have received the init and error message
    expect(scrumMaster.messagesReceivedAsExpected([EServerMessageType.Init, EServerMessageType.Error], false)).toBe(true);
    expect(scrumMaster.errorMessageReceived(EErrorCode.TeamAlreadyExists)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: connect a user
    const scrumMaster = Util.connectParticipant(handlerService);

    // Run: create the team passing an unknown participantId
    const message: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: 'some participant id',
      data: {
        nick: Util.scrumMaster1Nick,
        observer: false,
        cardSet: ECardSet.Cohn
      }
    }
    scrumMaster.sendMessage(message, Util.team1Name);

    // Test: the only messages received must be the init and the error message
    expect(scrumMaster.messagesReceivedAsExpected([EServerMessageType.Init, EServerMessageType.Error], false)).toBe(true);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('create with an invalid custom card set: unknown missing', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: customize a card set
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: ICard) => card.isUnknownEstimation);
    cohn.cards.splice(indexOfUnknown, 1);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.Custom, cohn);

    // Test: Scrum Master should have received an error
    expect(scrumMaster.messagesReceivedAsExpected([EServerMessageType.Init, EServerMessageType.Error], false)).toBe(true);
    expect(scrumMaster.errorMessageReceived(EErrorCode.UnknownEstimationCardMissing)).toBe(true);
  });

  test('create with an invalid custom card set: less than two estimation cards', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: customize a card set
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    cohn.cards.splice(1, 11);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.Custom, cohn);

    // Test: Scrum Master should have received an error
    expect(scrumMaster.messagesReceivedAsExpected([EServerMessageType.Init, EServerMessageType.Error], false)).toBe(true);
    expect(scrumMaster.errorMessageReceived(EErrorCode.MoreThanTwoEstimationCardsRequired)).toBe(true);
  });

  test('TeamName is empty', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Create team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, "", Util.scrumMaster1Nick, false, ECardSet.TShirt);

    // Test: the scrum master should have an init and an error message
    expect(scrumMaster.messagesReceivedAsExpected([EServerMessageType.Init, EServerMessageType.Error], false)).toBe(true);
    expect(scrumMaster.errorMessageReceived(EErrorCode.TeamNameMayNotBeEmtpy)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('nick is null or empty', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Create team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, "", false, ECardSet.TShirt);

    // Test: the scrum master should have an init and an error message
    expect(scrumMaster.messagesReceivedAsExpected([EServerMessageType.Init, EServerMessageType.Error], false)).toBe(true);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNameMayNotBeEmpty)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
})