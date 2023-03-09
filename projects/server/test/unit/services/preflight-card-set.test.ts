import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { ECardSet, EClientMessageType, EErrorCode, ICard, IChangeCardSetMessage, ICreate, ICreateMessage } from '../../../../shared-lib/src';
import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { IStorageService } from '../../../src/storage/interfaces';
import { Util } from '../util';

describe('preflight cardSet OK', () => {
  test('create OK with standard cardset', () => {
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: Util.scrummasterName
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('create OK with customized cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Custom,
      nick: Util.scrummasterName,
      cards: cohn
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('change cardset OK with standard cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('change cardset OK with customized cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });
});

describe('preflight cardSet not OK', () => {
  test('Create with unknown estimation missing', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: ICard) => card.isUnknownEstimation);
    cohn.cards.splice(indexOfUnknown, 1);
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Custom,
      nick: Util.scrummasterName,
      cards: cohn
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.UnknownEstimationCardMissing);
  });

  test('Change cardset with unknown estimation missing', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: ICard) => card.isUnknownEstimation);
    cohn.cards.splice(indexOfUnknown, 1);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.UnknownEstimationCardMissing);
  });

  test('Create with less than two estimation cards', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(1, 11);
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Custom,
      nick: Util.scrummasterName,
      cards: cohn
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.MoreThanTwoEstimationCardsRequired);
  });

  test('Change cardset with less than two estimation cards', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(1, 11);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.MoreThanTwoEstimationCardsRequired);
  });
});
