import { describe, expect, test } from '@jest/globals';
import { DisbandMessageDto, EClientMessageType, EErrorCode, EGameState } from 'shared-lib';
import { Util } from '../util.js';
import { IStorageService } from '../../../src/storage/interfaces/index.js';
import { Mock } from 'moq.ts';

describe('preflight Disband', () => {
  test('Success => Scrum master disbands', () => {
    const message: DisbandMessageDto = {
      type: EClientMessageType.Disband,
      senderId: Util.scrummasterName,
      data: Util.team1Name
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Cleared));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => Participant disbands', () => {
    const message: DisbandMessageDto = {
      type: EClientMessageType.Disband,
      senderId: Util.participant1Name,
      data: Util.team1Name
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Cleared));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ScrumMasterRequired
    );
  });

  test('Failure => Team may not be estimating', () => {
    const message: DisbandMessageDto = {
      type: EClientMessageType.Disband,
      senderId: Util.scrummasterName,
      data: Util.team1Name
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Started));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.DisbandNotAllowedDuringEstimation
    );
  });
});
