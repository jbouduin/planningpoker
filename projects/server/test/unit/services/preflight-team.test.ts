import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { ECardSet, EClientMessageType, EErrorCode, ICreate, ICreateMessage, IJoin, IJoinMessage, ILeaveMessage, IPauseMessage, IRejoinMessage } from '../../../../shared-lib/src';
import { IStorageService } from '../../../src/storage/interfaces';
import { Util } from '../util';

describe('preflight Create', () => {
  test('OK', () => {
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: Util.participant1Name
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => team already exists', () => {
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: Util.participant1Name
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.TeamAlreadyExists);
  });

  test('Failure => sender does not exist', () => {
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: Util.participant1Name
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => TeamName may not be empty', () => {
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: Util.participant1Name
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, '')).toBe(EErrorCode.TeamNameMayNotBeEmtpy);
  });

  test('Failure => Username may not be empty', () => {
    const data: ICreate = {
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: ''
    };
    const message: ICreateMessage = { type: EClientMessageType.Create, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNameMayNotBeEmpty);
  });
});

describe('preflight Join', () => {
  test('OK', () => {
    const data: IJoin = {
      observer: false,
      nick: Util.participant1Name
    };
    const message: IJoinMessage = { type: EClientMessageType.Join, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const data: IJoin = {
      observer: false,
      nick: Util.participant1Name
    };
    const message: IJoinMessage = { type: EClientMessageType.Join, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
    const data: IJoin = {
      observer: false,
      nick: Util.participant1Name
    };
    const message: IJoinMessage = { type: EClientMessageType.Join, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.TeamNotFound);
  });

  test('Failure => sender already member', () => {
    const data: IJoin = {
      observer: false,
      nick: Util.participant1Name
    };
    const message: IJoinMessage = { type: EClientMessageType.Join, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => sender member of another team', () => {
    const data: IJoin = {
      observer: false,
      nick: Util.participant1Name
    };
    const message: IJoinMessage = { type: EClientMessageType.Join, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => user name may not be empty', () => {
    const data: IJoin = {
      observer: false,
      nick: ''
    };
    const message: IJoinMessage = { type: EClientMessageType.Join, senderId: Util.participant1Name, data: data };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNameMayNotBeEmpty);
  })
});

describe('preflight Leave - Normal', () => {
  const message: ILeaveMessage = { type: EClientMessageType.Leave, senderId: Util.participant1Name, data: Util.participant1Name };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.TeamNotFound);
  });

  test('Failure => sender not in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
})

describe('preflight Leave - After Disconnect', () => {
  const message: ILeaveMessage = { type: EClientMessageType.Leave, senderId: Util.participant1Name, data: Util.participant2Name };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.TeamNotFound);
  });

  test('Failure => sender in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => sender in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam2())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => leaving participant does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(false)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => leaving participant not in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => leaving participant in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe('preflight Pause', () => {
  const message: IPauseMessage = { type: EClientMessageType.Pause, senderId: Util.participant1Name, data: undefined };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.TeamNotFound);
  });

  test('Failure => sender not in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => sender in another team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe("preflight Rejoin", () => {
  const message: IRejoinMessage = { type: EClientMessageType.Rejoin, senderId: Util.participant1Name, data: Util.participant2Name };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => team does not exists', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.TeamNotFound);
  });

  test('Failure => sender in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => sender in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam2())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Failure => rejoining participant does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(false)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Failure => rejoining participant not in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Failure => rejoining participant in other team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});



