import { describe, expect, jest, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { ECardSet, EClientMessageType, EErrorCode, EParticipantStatus, EPokerStatus, ERole, ICard, IChangeCardSetMessage, ICreate, ICreatemessage } from '../../../../shared-lib/src';
import { ITeam, ServerParticipant } from '../../../src/objects';
import { PreflightService } from '../../../src/services/implementation/preflight.service';
import { IPreflightService } from '../../../src/services/interfaces';
import { IWebSocket, ReadyState } from '../../../src/services/websocket';
import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { IStorageService } from '../../../src/storage/interfaces';

const scrummasterName = 'scrum-master';
const socket: IWebSocket = {
  readyState: ReadyState.OPEN,
  close: jest.fn(undefined),
  send: jest.fn(undefined)
};

const scrummaster = new ServerParticipant(
  {
    nick: scrummasterName,
    participantId: scrummasterName,
    role: ERole.ScrumMaster,
    status: EParticipantStatus.Connected,
    observer: true
  }, socket);
const team1Name = 'team1';
const team1: ITeam = {
  teamName: team1Name,
  lastAccessTime: Date.now(),
  status: EPokerStatus.Cleared
}

const service: IPreflightService = new PreflightService();

describe('cardSet OK', () => {
  test('create OK with standard cardset', () => {
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: scrummasterName
    };
    const message: ICreatemessage = { type: EClientMessageType.Create, senderId: scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('create OK with customized cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Custom,
      nick: scrummasterName,
      cards: cohn
    };
    const message: ICreatemessage = { type: EClientMessageType.Create, senderId: scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('change cardset OK with standard cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('change cardset OK with customized cardset', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(9, 3);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });
});

describe('cardSet not OK', () => {
  test('Create with unknown estimation missing', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: ICard) => card.index === cohn.unknownEstimationIndex);
    cohn.cards.splice(indexOfUnknown, 1);
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Custom,
      nick: scrummasterName,
      cards: cohn
    };
    const message: ICreatemessage = { type: EClientMessageType.Create, senderId: scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.UnknownEstimationCardMissing);
  });

  test('Change cardset with unknown estimation missing', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    const indexOfUnknown = cohn.cards.findIndex((card: ICard) => card.index === cohn.unknownEstimationIndex);
    cohn.cards.splice(indexOfUnknown, 1);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.UnknownEstimationCardMissing);
  });

  test('Create with less than two estimation cards', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(1, 11);
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Custom,
      nick: scrummasterName,
      cards: cohn
    };
    const message: ICreatemessage = { type: EClientMessageType.Create, senderId: scrummasterName, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.MoreThanTwoEstimationCardsRequired);
  });

  test('Change cardset with less than two estimation cards', () => {
    const cohn = new FactoryService().createCardSet(ECardSet.Cohn);
    cohn.cards.splice(1, 11);
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: scrummasterName,
      data: cohn
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.MoreThanTwoEstimationCardsRequired);
  });
})