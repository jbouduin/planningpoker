import { describe, expect, test } from '@jest/globals';
import {
  CardDto,
  ECardSetType,
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantState,
  ERole,
  EServerMessageType,
  ICardSetMessage,
  ICreateMessage,
  IInitMessage,
  IParticipantListMessage,
  ISelfMessage,
  ITeamNameMessage
} from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { IFactoryService } from '../../../src/storage/interfaces/index.js';
import STORAGETYPES from '../../../src/storage/storage.types.js';
import { ITestScrumMaster } from './helpers/TestScrumMaster.js';
import { Util } from './helpers/util.js';

describe('create => OK', () => {
  test('Standard Create', () => {
    const container = Util.getContainer();
    const tshirt = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.TShirt);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Create team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService,
      Util.team1Name,
      Util.scrumMaster1Nick,
      false,
      ECardSetType.TShirt
    );

    // Test: Scrum master initial messages
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init, (m: IInitMessage) => {
        expect(m.data.participantId).toBeDefined();
        expect(m.data.participantId.length).toBeGreaterThan(0);
      })
      .expectNextMessageIs(EServerMessageType.Self, (m: ISelfMessage) => {
        expect(m.data.nick).toBe(Util.scrumMaster1Nick);
        expect(m.data.state).toBe(EParticipantState.Connected);
        expect(m.data.role).toBe(ERole.ScrumMaster);
        expect(m.data.observer).toBe(false);
      })
      .expectNextMessageIs(EServerMessageType.TeamName, (m: ITeamNameMessage) => expect(m.data).toBe(Util.team1Name))
      .expectNextMessageIs(EServerMessageType.CardSet, (m: ICardSetMessage) => {
        expect(m.data.cardSet).toBe(ECardSetType.TShirt);
        expect(m.data.cards).toHaveLength(tshirt.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.MemberList, (m: IParticipantListMessage) => expect(m.data.length).toBe(0))
      .expectNextMessageIsGameStateChanged(EGameState.Cleared)
      .expectNextMessageIs(EServerMessageType.EndInit)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Create as observer', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService,
      Util.team1Name,
      Util.scrumMaster1Nick,
      true,
      ECardSetType.TShirt
    );

    // Test: check if the observer flag was send correctly
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIs(EServerMessageType.Self, (m: ISelfMessage) => expect(m.data.observer).toBe(true))
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(EServerMessageType.CardSet)
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIsGameStateChanged(EGameState.Cleared)
      .expectNextMessageIs(EServerMessageType.EndInit)
      .expectNoMoreMessages();
  });

  test('Create with a custom card list', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: customize a card set
    const customizedCohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.Cohn);
    customizedCohn.cards.splice(9, 3);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService,
      Util.team1Name,
      Util.scrumMaster1Nick,
      true,
      ECardSetType.Custom,
      customizedCohn
    );

    // Test: check if the card set message contains the correct data
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIs(EServerMessageType.Self)
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(EServerMessageType.CardSet, (m: ICardSetMessage) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(customizedCohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIsGameStateChanged(EGameState.Cleared)
      .expectNextMessageIs(EServerMessageType.EndInit)
      .expectNoMoreMessages();
  });

  test('Create with a custom card list without cards', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: get Cohn set for testing afterwards
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.Cohn);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService,
      Util.team1Name,
      Util.scrumMaster1Nick,
      true,
      ECardSetType.Custom,
      undefined
    );

    // Test: check if the card set message contains the correct data
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIs(EServerMessageType.Self)
      .expectNextMessageIs(EServerMessageType.TeamName)
      .expectNextMessageIs(EServerMessageType.CardSet, (m: ICardSetMessage) => {
        expect(m.data.cardSet).toBe(ECardSetType.Cohn);
        expect(m.data.cards).toHaveLength(cohn.cards.length);
      })
      .expectNextMessageIs(EServerMessageType.MemberList)
      .expectNextMessageIsGameStateChanged(EGameState.Cleared)
      .expectNextMessageIs(EServerMessageType.EndInit)
      .expectNoMoreMessages();
  });
});

describe('Create => Failure', () => {
  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: connect a user
    const scrumMaster = Util.connectParticipant(handlerService);

    // Run: create the team passing an unknown participantId
    const message: ICreateMessage = {
      type: EClientMessageType.Create,
      senderId: Util.unknownParticipantId,
      data: {
        nick: Util.scrumMaster1Nick,
        observer: false,
        cardSet: ECardSetType.Cohn
      }
    };
    scrumMaster.sendMessage(message, Util.team1Name);

    // Test: Scrum master messages
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.ParticipantNotFound)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Team already exists', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: Try to recreate the unaffected team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService,
      unaffectedTeam.teamName,
      Util.scrumMaster1Nick,
      false,
      ECardSetType.TShirt
    );

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.TeamAlreadyExists)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('create with an invalid custom card set: unknown missing', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: customize a card set: take the unknown estimation out
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: CardDto) => card.isUnknownEstimation);
    cohn.cards.splice(indexOfUnknown, 1);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService,
      Util.team1Name,
      Util.scrumMaster1Nick,
      true,
      ECardSetType.Custom,
      cohn
    );

    // Test: Scrum Master messages
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.UnknownEstimationCardMissing)
      .expectNoMoreMessages();
  });

  test('create with an invalid custom card set: less than two estimation cards', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // Setup: customize a card set
    const cohn = container.get<IFactoryService>(STORAGETYPES.FactoryService).createCardSet(ECardSetType.Cohn);
    cohn.cards.splice(1, 11);

    // Run: create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService,
      Util.team1Name,
      Util.scrumMaster1Nick,
      true,
      ECardSetType.Custom,
      cohn
    );

    // Test: Scrum Master messages
    scrumMaster
      .initializeMessageQueue(false)
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
      handlerService,
      '',
      Util.scrumMaster1Nick,
      false,
      ECardSetType.TShirt
    );

    // Test: Scrum master messages
    scrumMaster
      .initializeMessageQueue(false)
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
      handlerService,
      Util.team1Name,
      '',
      false,
      ECardSetType.TShirt
    );

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue(false)
      .expectNextMessageIs(EServerMessageType.Init)
      .expectNextMessageIsError(EErrorCode.ParticipantNameMayNotBeEmpty)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
