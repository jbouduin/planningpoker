import { describe, expect, jest, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { ECardSet, EClientMessageType, EErrorCode, ERole, IChangeCardSetMessage, IEstimateMessage, IRevealMessage, IStartMessage } from '../../../shared-lib/src';

import { Participant } from '../../src/objects';
import { PreflightService } from '../../src/services/implementation/preflight.service';
import { IPreflightService } from '../../src/services/interfaces';
import { IWebSocket, ReadyState } from '../../src/services/websocket';
import { IStorageService } from '../../src/storage/interfaces';

const socket: IWebSocket = {
  readyState: ReadyState.OPEN,
  close: jest.fn(undefined),
  send: jest.fn(undefined)
};
const participant1Name = 'participant1';
const participant1 = new Participant(participant1Name, participant1Name, ERole.Unknown, socket);
participant1.observer = false;
const scrummasterName = 'scrum-master';
const observerName = 'observer';
const observer = new Participant(observerName, observerName, ERole.ScrumMaster, socket);
observer.observer = true;
const scrummaster = new Participant(scrummasterName, scrummasterName, ERole.ScrumMaster, socket);
const team1Name = 'team1';
const team2Name = 'team2';
const service: IPreflightService = new PreflightService();

describe('preflight Start', () => {
  test('OK', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team2Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender is not scrum master', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderUuid: participant1Name, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });
});

describe('preflight Reveal', () => {
  test('OK', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderUuid: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender is not scrum master', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderUuid: participant1Name, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });
});

describe('preflight ChangeCardSet', () => {
  const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };

  test('OK', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderUuid: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderUuid: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderUuid: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderUuid: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderUuid: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender is not scrum master', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderUuid: participant1Name, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });
});

describe('preflight Estimate', () => {
  test('OK', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderUuid: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderUuid: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderUuid: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderUuid: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderUuid: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team2Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => observer can not estimate', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderUuid: observerName, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(observerName))
      .returns(observer)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(observerName))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ObserverCanNotEstimate);
  });
});
