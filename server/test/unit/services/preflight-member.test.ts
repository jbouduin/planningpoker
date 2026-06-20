import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import {
  EClientMessageType,
  EErrorCode,
  IChangeNickMessage,
  IChangeScrumMasterMessage,
  IObserveMessage,
  IObserverChange,
  IRemoveMessage
} from '../../../../shared-lib/src';
import { IStorageService } from '../../../src/storage/interfaces';
import { Util } from '../util';

describe('preflight Observe - toggle self', () => {
  const data: IObserverChange = {
    member: Util.participant1Name,
    observer: true
  };
  const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.participant1Name, data: data };

  test('OK', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender not in team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender in another team', () => {
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });
});

describe('preflight Observe - toggle other', () => {
  test('OK', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender not in team', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam2())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender not scrum master', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.participant1Name, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ScrumMasterRequired
    );
  });

  test('Failure => toggled participant does not exist', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(false)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => toggled participant not in team', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => toggled participant in another team', () => {
    const data: IObserverChange = {
      member: Util.participant2Name,
      observer: true
    };
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderId: Util.scrummasterName, data: data };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });
});

describe('preflight ChangeNick', () => {
  test('OK', () => {
    const message: IChangeNickMessage = {
      type: EClientMessageType.ChangeNick,
      senderId: Util.participant1Name,
      data: Util.participant2Name
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IChangeNickMessage = {
      type: EClientMessageType.ChangeNick,
      senderId: Util.participant1Name,
      data: Util.participant2Name
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => Name may not be empty', () => {
    const message: IChangeNickMessage = {
      type: EClientMessageType.ChangeNick,
      senderId: Util.participant1Name,
      data: ''
    };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNameMayNotBeEmpty
    );
  });
});

describe('preflight Remove', () => {
  test('OK', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender not in team', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender not another team', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam2())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });
  test('Failure => sender not scrum master', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.participant1Name,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ScrumMasterRequired
    );
  });

  test('Failure => target does not exist', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(false)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => target not in team', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => target in another team', () => {
    const message: IRemoveMessage = {
      type: EClientMessageType.Remove,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.participantExists(Util.participant2Name))
      .returns(true)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });
});

describe('preflight ChangeScrumMaster', () => {
  test('OK', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(EErrorCode.NoError);
  });

  test('Failure => sender does not exist', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => team does not exist', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(false)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.TeamNotFound
    );
  });

  test('Failure => sender in no team', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(undefined)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender not in team', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam2())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => sender not scrum master', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.participant1Name,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant1Name))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ScrumMasterRequired
    );
  });

  test('Failure => target does not exist', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(undefined)
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam1());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotFound
    );
  });

  test('Failure => target not in team', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(undefined);
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => target in another team', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.participant2Name
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.participant2Name))
      .returns(Util.getTeam2());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.ParticipantNotInTeam
    );
  });

  test('Failure => new scrum master is not online', () => {
    const message: IChangeScrumMasterMessage = {
      type: EClientMessageType.ChangeScrumMaster,
      senderId: Util.scrummasterName,
      data: Util.disconnectedName
    };

    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup((service: IStorageService) => service.getParticipant(Util.participant2Name))
      .returns(Util.getParticipant2())
      .setup((service: IStorageService) => service.teamExists(Util.team1Name))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.disconnectedName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getParticipant(Util.disconnectedName))
      .returns(Util.getDisconnected());
    expect(Util.getPreflightService().preflight(storage.object(), message, Util.team1Name)).toBe(
      EErrorCode.NewScrumMasterIsNotConnected
    );
  });
});
