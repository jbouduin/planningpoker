import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';
import {
  CardDto,
  CreateDto,
  ECardSetType,
  EClientMessageType,
  EErrorCode,
  IChangeCardSetMessage,
  ICreateMessage
} from 'shared-lib';
import { FactoryService } from '../../../src/storage/implementation/index.js';
import type { IStorageService } from '../../../src/storage/interfaces/index.js';
import { Util } from '../util.js';

describe('preflight cardSet OK', () => {
  test('create OK with standard cardset', () => {
    const data: CreateDto = {
      observer: false,
      cardSet: ECardSetType.Cohn,
      nick: Util.scrummasterName
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('create OK with customized cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSetType.Cohn);
    cohn.cards.splice(9, 3);
    const data: CreateDto = {
      observer: false,
      cardSet: ECardSetType.Custom,
      nick: Util.scrummasterName,
      cards: cohn
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('change cardset OK with standard cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSetType.Cohn);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('change cardset OK with customized cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSetType.Cohn);
    cohn.cards.splice(9, 3);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });
});

describe('preflight cardSet not OK', () => {
  test('Create with unknown estimation missing', () => {
    const cohn = new FactoryService().createCardSet(ECardSetType.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: CardDto) => card.isUnknownEstimation);
    cohn.cards.splice(indexOfUnknown, 1);
    const data: CreateDto = {
      observer: false,
      cardSet: ECardSetType.Custom,
      nick: Util.scrummasterName,
      cards: cohn
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.UnknownEstimationCardMissing
    );
  });

  test('Change cardset with unknown estimation missing', () => {
    const cohn = new FactoryService().createCardSet(ECardSetType.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: CardDto) => card.isUnknownEstimation);
    cohn.cards.splice(indexOfUnknown, 1);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.UnknownEstimationCardMissing
    );
  });

  test('Create with less than two estimation cards', () => {
    const cohn = new FactoryService().createCardSet(ECardSetType.Cohn);
    cohn.cards.splice(1, 11);
    const data: CreateDto = {
      observer: false,
      cardSet: ECardSetType.Custom,
      nick: Util.scrummasterName,
      cards: cohn
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.MoreThanTwoEstimationCardsRequired
    );
  });

  test('Change cardset with less than two estimation cards', () => {
    const cohn = new FactoryService().createCardSet(ECardSetType.Cohn);
    cohn.cards.splice(1, 11);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.MoreThanTwoEstimationCardsRequired
    );
  });
});
