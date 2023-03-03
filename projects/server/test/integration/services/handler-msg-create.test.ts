import { describe, expect, test } from '@jest/globals';

import { ECardSet, EClientMessageType, EErrorCode, EParticipantStatus, ERole, EServerMessageType, ICardSetMessage, ICreatemessage, IEstimationsMessage, IMemberListMessage, ISelfMessage, ITeamNameMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { ICardService, IHandlerService } from '../../../src/services/interfaces';
import { ITestScrumMaster } from './helpers/TestScrumMaster';
import { Util } from "./helpers/util";

describe('create => OK', () => {
  test('Standard Create', () => {
    const container = Util.getContainer();
    const tshirt = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.TShirt);
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Create team 1
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, false, ECardSet.TShirt);

    // check the initial messages received by the scrum master
    expect(scrumMaster.totalMessagesReceived).toBe(scrumMaster.expectedNumberOfInitialMessages);
    expect(scrumMaster.countMessageType(EServerMessageType.Self, false)).toBe(1);
    const selfMessage = scrumMaster.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.nick).toBe(Util.scrumMaster1Nick);
      expect(selfMessage.data.status).toBe(EParticipantStatus.Connected);
      expect(selfMessage.data.role).toBe(ERole.ScrumMaster);
      expect(selfMessage.data.observer).toBe(false);
    }
    expect(scrumMaster.countMessageType(EServerMessageType.TeamName, false)).toBe(1);
    const teamMessage = scrumMaster.extractMessage<ITeamNameMessage>(EServerMessageType.TeamName, false);
    if (teamMessage) {
      expect(teamMessage.data).toBe(Util.team1Name);
    }
    expect(scrumMaster.countMessageType(EServerMessageType.CardList, false)).toBe(1);
    const cardSetMessage = scrumMaster.extractMessage<ICardSetMessage>(EServerMessageType.CardList, false);
    expect(cardSetMessage).toBeDefined();
    if (cardSetMessage) {
      expect(cardSetMessage.data.cardSet).toBe(ECardSet.TShirt);
      expect(cardSetMessage.data.cards).toHaveLength(tshirt.cards.length);
    }
    expect(scrumMaster.countMessageType(EServerMessageType.MemberList, false)).toBe(1);
    const memberListMessage = scrumMaster.extractMessage<IMemberListMessage>(EServerMessageType.MemberList, false);
    expect(memberListMessage).toBeDefined();
    if (memberListMessage) {
      expect(memberListMessage.data).toHaveLength(0);
    }
    expect(scrumMaster.countMessageType(EServerMessageType.EstimationList, false)).toBe(1);
    const estimationListMessage = scrumMaster.extractMessage<IEstimationsMessage>(EServerMessageType.EstimationList, false);
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

    // create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.TShirt);

    // check if the observer flag was send correctly
    const selfMessage = scrumMaster.extractMessage<ISelfMessage>(EServerMessageType.Self, false);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.observer).toBe(true);
    }
  });

  test('Create with a custom card list', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // customize a card set
    const cohn = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);

    // create the team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, Util.team1Name, Util.scrumMaster1Nick, true, ECardSet.Custom, cohn);

    // check if the card set message contains the correct data
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

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Try to recreate the unaffected team
    const scrumMaster: ITestScrumMaster = Util.createTeam(
      handlerService, unaffectedTeam.teamName, Util.scrumMaster1Nick, false, ECardSet.TShirt);

    // Test: scrum master should only have received the init and error message
    expect(scrumMaster.totalMessagesReceived).toBe(2);
    expect(scrumMaster.errorMessageReceived(EErrorCode.TeamAlreadyExists)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Sender not found', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // connect a user
    const scrumMaster = Util.connectParticipant(handlerService);
    scrumMaster.teamName = Util.team1Name;
    // create the team with an unknown participant
    const message: ICreatemessage = {
      type: EClientMessageType.Create,
      senderId: 'some participant id',
      data: {
        nick: Util.scrumMaster1Nick,
        team: Util.team1Name,
        observer: false,
        cardSet: ECardSet.Cohn
      }
    }
    scrumMaster.sendMessage(message);

    // Test: the only messages received must be the init and the error message
    expect(scrumMaster.totalMessagesReceived).toBe(2);
    expect(scrumMaster.countMessageType(EServerMessageType.Init, false)).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ParticipantNotFound)).toBe(true);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2372 test('TeamName is empty', () => { });
  // TODO 2372 test('nick is null or empty', () => { });
  // TODO 2366 test('create with an invalid custom card set', () => { });
})