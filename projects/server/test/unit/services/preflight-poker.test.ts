import { describe, expect, jest, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { ECardSet, EClientMessageType, EErrorCode, EParticipantStatus, EPokerStatus, ERole, IChangeCardSetMessage, IEstimateMessage, IRevealMessage, IStartMessage } from '../../../../shared-lib/src';
import { ITeam, ServerParticipant } from '../../../src/objects';
import { PreflightService } from '../../../src/services/implementation/preflight.service';
import { IPreflightService } from '../../../src/services/interfaces';
import { IWebSocket, ReadyState } from '../../../src/services/websocket';
import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { IStorageService } from '../../../src/storage/interfaces';

const socket: IWebSocket = {
  readyState: ReadyState.OPEN,
  close: jest.fn(undefined),
  send: jest.fn(undefined)
};
const participant1Name = 'participant1';
const participant1 = new ServerParticipant(
  {
    nick: participant1Name,
    participantId: participant1Name,
    role: ERole.Developer,
    status: EParticipantStatus.Connected,
    observer: false
  }, socket);
const observerName = 'observer';
const observer = new ServerParticipant(
  {
    nick: observerName,
    participantId: observerName,
    role: ERole.Developer,
    status: EParticipantStatus.Connected,
    observer: true
  }, socket);
const scrummasterName = 'scrum-master';
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
const team2Name = 'team2';
const team2: ITeam = {
  teamName: team2Name,
  lastAccessTime: Date.now(),
  status: EPokerStatus.Cleared
}
const service: IPreflightService = new PreflightService();

describe('preflight Start', () => {
  test('OK', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team2);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender is not scrum master', () => {
    const message: IStartMessage = { type: EClientMessageType.Start, senderId: participant1Name, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });
});

describe('preflight Reveal', () => {
  test('OK', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderId: scrummasterName, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender is not scrum master', () => {
    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderId: participant1Name, data: undefined };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });
});

describe('preflight ChangeCardSet', () => {
  const cardSet = new FactoryService().createCardSet(ECardSet.Cohn);

  test('OK', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderId: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderId: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderId: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderId: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderId: scrummasterName, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(scrummasterName))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender is not scrum master', () => {
    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderId: participant1Name, data: cardSet };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });
});

describe('preflight Estimate', () => {
  test('OK', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: participant1Name, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team2);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => observer can not estimate', () => {
    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderId: observerName, data: 1 };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(observerName))
      .returns(observer)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(observerName))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ObserverCanNotEstimate);
  });
});
