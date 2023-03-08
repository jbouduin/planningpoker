import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EParticipantStatus, ERole, EServerMessageType, ICard, ICardSetMessage, ICreatemessage, IEstimationListMessage, IInitMessage, IMemberListMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';

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

    // Test: Scrum master initial messages
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(
        EServerMessageType.Init,
        (m: IInitMessage) => {
          expect(m.data.participantId).toBeDefined();
          expect(m.data.participantId.length).toBeGreaterThan(0);
        }
      )
      .expectNextMessageIs(
        EServerMessageType.Self,
        (m: ISelfMessage) => {
          expect(m.data.nick).toBe(Util.scrumMaster1Nick);
          expect(m.data.status).toBe(EParticipantStatus.Connected);
          expect(m.data.role).toBe(ERole.ScrumMaster);
          expect(m.data.observer).toBe(false);
        }
      )
      .expectNextMessageIs(
        EServerMessageType.TeamName,
        (m: ITeamNameMessage) => expect(m.data).toBe(Util.team1Name)
      )
      .expectNextMessageIs(
        EServerMessageType.CardList,
        (m: ICardSetMessage) => {
          expect(m.data.cardSet).toBe(ECardSet.TShirt)
          expect(m.data.cards).toHaveLength(tshirt.cards.length);
        }
      )
      .expectNextMessageIs(
        EServerMessageType.MemberList,
        (m: IMemberListMessage) => expect(m.data.length).toBe(0)
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data.length).toBe(0)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Create as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.TShirt);

    // Test: check if the observer flag was send correctly
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIs(
        EServerMessageType.Self,
        (m: ISelfMessage) => expect(m.data.observer).toBe(true)
      )
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(EServerMessageType.CardList)
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIs(EServerMessageType.EstimationList)
      .expectNoMoreMessages();

  });

  test('Create with a custom card list', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(9, 3);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.Custom, customizedCohn);

    // Test: check if the card set message contains the correct data
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIs(EServerMessageType.Self)
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(
        EServerMessageType.CardList,
        (m: ICardSetMessage) => {
          expect(m.data.cardSet).toBe(ECardSet.Cohn);
          expect(m.data.cards).toHaveLength(customizedCohn.cards.length)
        }
      )
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIs(EServerMessageType.EstimationList)
      .expectNoMoreMessages();
    ;
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
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIs(EServerMessageType.Self)
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(
        EServerMessageType.CardList,
        (m: ICardSetMessage) => {
          expect(m.data.cardSet).toBe(ECardSet.Cohn);
          expect(m.data.cards).toHaveLength(cohn.cards.length);
        }
      )
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIs(EServerMessageType.EstimationList)
      .expectNoMoreMessages();
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

    // Test: scrum master messages
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.TeamAlreadyExists)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
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

    // Test: Scrum master messages
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('create with an invalid custom card set: unknown missing', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: customize a card set: take the unknown estimation out
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSet.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: ICard) => card.isUnknownEstimation);
    cohn.cards.splice(indexOfUnknown, 1);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.Custom, cohn);

    // Test: Scrum Master messages
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.UnknownEstimationCardMissing)
      .expectNoMoreMessages();
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

    // Test: Scrum Master messages
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.MoreThanTwoEstimationCardsRequired)
      .expectNoMoreMessages();
  });

  test('TeamName is empty', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Create team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, "", Util.scrumMaster1Nick, false, ECardSet.TShirt);

    // Test: Scrum master messages
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.TeamNameMayNotBeEmtpy)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('nick is null or empty', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Create team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, "", false, ECardSet.TShirt);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageIterator(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.ParticipantNameMayNotBeEmpty)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
})