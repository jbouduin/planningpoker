import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';
import { ECardSetType, EClientMessageType, EErrorCode, EGameState, IChangeCardSetMessage } from 'shared-lib';
import { FactoryService } from '../../../src/storage/implementation/index.js';
import type { IStorageService } from '../../../src/storage/interfaces/index.js';
import { Util } from '../util.js';

describe('preflight ChangeCardSet', () => {
  const cardSet = new FactoryService().createCardSet(ECardSetType.Cohn);

  test('OK', () => {
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cardSet
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

  test('Failure => sender does not exist', () => {
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cardSet
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cardSet
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender not in team', () => {
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cardSet
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender in another team', () => {
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.scrummasterName,
      data: cardSet
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender is not scrum master', () => {
    const message: IChangeCardSetMessage = {
      type: EClientMessageType.ChangeCardSet,
      senderId: Util.participant1Name,
      data: cardSet
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ScrumMasterRequired
    );
  });

  test('Change cardset not allowed during estimation', () => {
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
      .returns(Util.getTeam1(EGameState.Started));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ChangeCardSetNotAllowedDuringEstimation
    );
  });
});
