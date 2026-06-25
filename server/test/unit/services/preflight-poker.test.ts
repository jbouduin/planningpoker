import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';
import {
  ECardSetType,
  EClientMessageType,
  EErrorCode,
  EGameState,
  IChangeCardSetMessage,
  IEstimateMessage,
  IRevealMessage,
  IStartMessage
} from 'shared-lib';
import { FactoryService } from '../../../src/storage/implementation';
import { IStorageService } from '../../../src/storage/interfaces';
import { Util } from '../util';

describe('preflight Start', () => {
  test('OK', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getParticipant1(), Util.getParticipant2()]);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getParticipant1(), Util.getParticipant2()]);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getParticipant1(), Util.getParticipant2()]);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender not in team', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getParticipant1(), Util.getParticipant2()]);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender in another team', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam2())
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getParticipant1(), Util.getParticipant2()]);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender is not scrum master', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.participant1Name, data: undefined };
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

  test('Failure => already started', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Started))
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getParticipant1(), Util.getParticipant2()]);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.EstimationAlreadyStarted
    );
  });

  test('Fialure => only observers connected', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: Util.scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getObserver1(), Util.getObserver2()]);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.OnlyObserversOnline
    );
  });
});

describe('preflight Reveal', () => {
  test('OK', () => {
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.scrummasterName,
      data: undefined
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Started));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.scrummasterName,
      data: undefined
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Started));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.scrummasterName,
      data: undefined
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Started));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender not in team', () => {
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.scrummasterName,
      data: undefined
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
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.scrummasterName,
      data: undefined
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
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.participant1Name,
      data: undefined
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1(EGameState.Started));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ScrumMasterRequired
    );
  });

  test('Failure => not started (Cleared)', () => {
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.scrummasterName,
      data: undefined
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Cleared));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.EstimationNotStarted
    );
  });

  test('Failure => not started (Revealed)', () => {
    const message: IRevealMessage = {
      type: EClientMessageType.Reveal,
      senderId: Util.scrummasterName,
      data: undefined
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1(EGameState.Revealed));
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.EstimationNotStarted
    );
  });
});

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

describe('preflight Estimate', () => {
  test('OK', () => {
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
    const message: IEstimateMessage = {
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
