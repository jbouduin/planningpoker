import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';
import { EClientMessageType, EErrorCode, EGameState, IEstimateMessage, IWithDrawMessage } from 'shared-lib';
import type { IStorageService } from '../../../src/storage/interfaces/index.js';
import { Util } from '../util.js';

describe('preflight Estimate', () => {
  test('Standard use-case', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Edge case - card with index 0', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 0 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender not in team', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender in another team', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam2(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => observer can not estimate', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.observerName1, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.observerName1))
      .returns(Util.getObserver1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.observerName1))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ObserverCanNotEstimate
    );
  });

  test('Failure => not started (Cleared)', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Cleared))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.EstimationNotStarted
    );
  });

  test('Failure => not started (Revealed)', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Revealed))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.EstimationNotStarted
    );
  });

  test('Failure => non existing card', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: Util.participant1Name, data: 5 };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.InvalidEstimation
    );
  });
});

describe('preflight witdraw estimation', () => {
  test('OK', () => {
    const message: IWithDrawMessage = {
      type: EClientMessageType.Estimate,
      senderId: Util.participant1Name,
      data: undefined
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getCardSet(Util.team1Name))
      .returns(Util.getCardSet());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });
});
