import { describe, expect, jest, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { ECardSet, EClientMessageType, EErrorCode, EParticipantStatus, EPokerStatus, ERole, ICreate, ICreatemessage, IJoin, IJoinMessage, ILeaveMessage, IPauseMessage, IRejoinMessage } from '../../../../shared-lib/src';

import { ITeam, ServerParticipant } from '../../../src/objects';
import { PreflightService } from '../../../src/services/implementation/preflight.service';
import { IPreflightService } from '../../../src/services/interfaces';
import { IWebSocket, ReadyState } from '../../../src/services/websocket';
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
const participant2Name = 'participant2';
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

describe('preflight Create', () => {
  const data: ICreate = {
    observer: false,
    cardSet: ECardSet.Cohn,
    nick: participant1Name
  };
  const message: ICreatemessage = { type: EClientMessageType.Create, senderId: participant1Name, data: data };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => team already exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamAlreadyExists);
  });

  test('Failure => sender does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });
});

describe('preflight Join', () => {
  const data: IJoin = {
    observer: false,
    nick: participant1Name
  };
  const message: IJoinMessage = { type: EClientMessageType.Join, senderId: participant1Name, data: data };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender already member', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => sender member of another team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team2);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });
});

describe('preflight Leave - Normal', () => {
  const message: ILeaveMessage = { type: EClientMessageType.Leave, senderId: participant1Name, data: participant1Name };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
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
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team2);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
})

describe('prefligh Leave - After Disconnect', () => {
  const message: ILeaveMessage = { type: EClientMessageType.Leave, senderId: participant1Name, data: participant2Name };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => sender in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team2)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => leaving participant does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(false)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => leaving participant not in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => leaving participant in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team2);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe('prefligh Pause', () => {
  const message: IPauseMessage = { type: EClientMessageType.Pause, senderId: participant1Name, data: undefined };

  test('OK', () => {
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
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team2);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe("preflight Rejoin", () => {
  const message: IRejoinMessage = { type: EClientMessageType.Rejoin, senderId: participant1Name, data: participant2Name };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Failure => sender in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team1)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => sender in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(team2)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => rejoining participant does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(false)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team1);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => rejoining participant not in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(undefined);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => rejoining participant in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(participant1Name))
      .returns(participant1)
      .setup((service: IStorageService) => service.participantExists(participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(participant2Name))
      .returns(team2);
    expect(service.preflight(storage.object(), message, team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});



