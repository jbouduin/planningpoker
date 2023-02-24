import { describe, expect, jest, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { EClientMessageType, EErrorCode, ERole, IChangeNickMessage, IChangeScrumMasterMessage, IObserveMessage, IObserverChange, IRemoveMessage } from '../../../shared-lib/src';

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
const participant2Name = 'participant2';
const scrummasterName = 'scrum-master';
const scrummaster = new Participant(scrummasterName, scrummasterName, ERole.ScrumMaster, socket);
const team1Name = 'team1';
const team2Name = 'team2';
const service: IPreflightService = new PreflightService();

describe('preflight Observe - toggle self', () => {
  const data: IObserverChange = {
    member: participant1Name,
    observer: true
  }
  const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: participant1Name, data: data };

  test('OK', () => {
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
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team2Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe('preflight Observe - toggle other', () => {
  test('OK', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team2Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender not scrum master', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: participant1Name, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });

  test('Failure => toggled participant does not exist', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(false)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => toggled participant not in team', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => toggled participant in another team', () => {
    const data: IObserverChange = {
      member: participant2Name,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team2Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe('preflight ChangeNick', () => {
  const message: IChangeNickMessage = { type: EClientMessageType.ChangeNick, senderUuid: participant1Name, data: participant2Name };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });
});

describe('preflight Remove', () => {
  test('OK', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team2Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender not scrum master', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: participant1Name, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });

  test('Failure => target does not exist', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(false)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => target not in team', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => target in another team', () => {
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team2Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe("preflight ChangeScrumMaster", () => {
  test('OK', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender not in team', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team2Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender not scrum master', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: participant1Name, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant1Name))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ScrumMasterRequired);
  });

  test('Failure => target does not exist', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(false)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team1Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => target not in team', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => target in another team', () => {
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: scrummasterName, data: participant2Name };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(scrummasterName))
      .returns(scrummaster)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(scrummasterName))
      .returns(team1Name)
      .setup((service: IStorageService) => service.getTeamNameOfParticipant(participant2Name))
      .returns(team2Name);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

