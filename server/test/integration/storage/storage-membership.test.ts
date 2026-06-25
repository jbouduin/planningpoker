import { describe, expect, test } from '@jest/globals';
import { ECardSetType, EErrorCode, EParticipantState } from 'shared-lib';
import { IFactoryService, IStorageService } from '../../../src/storage/interfaces';
import STORAGETYPES from '../../../src/storage/storage.types';
import { Util } from './util';

describe('Join/Leave', () => {
  test('Join', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // create first participant
    const participant1 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant1);
    // create second participant
    const participant2 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant2);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // first participant joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant1.participantId);
    // second participant joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2.participantId);
    // retrieve
    const teamMembers = container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name);
    // test
    expect(teamMembers).toHaveLength(2);
    expect(teamMembers[0].participantId).not.toBe(teamMembers[1].participantId);
  });

  test('Leave', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // create first participant
    const participant1 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant1);
    // create second participant
    const participant2 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant2);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // first participant joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant1.participantId);
    // second participant joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2.participantId);
    // participant 1 leaves
    container.get<IStorageService>(STORAGETYPES.StorageService).leaveTeam(Util.team1Name, participant1.participantId);
    // retrieve
    const teamMembers = container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name);
    // test
    expect(teamMembers).toHaveLength(1);
    expect(teamMembers[0].participantId).toBe(participant2.participantId);
  });
});

describe('Can rejoin', () => {
  test('Can', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // create first participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // first participant joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant.participantId, Util.team1Name)
    ).toBe(EErrorCode.NoError);
  });

  test('Can not: team does not exist', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    // create first participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant.participantId, Util.team1Name)
    ).toBe(EErrorCode.TeamNotFound);
  });

  test('Can not: participant does not exist', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // test
    expect(
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .canRejoin('non existing participantId', Util.team1Name)
    ).toBe(EErrorCode.ParticipantNotFound);
  });

  test('Can not: participant not in team', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // create first participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant.participantId, Util.team1Name)
    ).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Can not: participant in other team', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet1 = factory.createCardSet(ECardSetType.Fibonacci);
    const cardSet2 = factory.createCardSet(ECardSetType.Cohn);
    // create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team 1
    let team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet1);
    // Setup: create team 2
    team = factory.createTeam(Util.team2Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet2);
    // first participant joins team 1
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant.participantId, Util.team2Name)
    ).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe('Queries', () => {
  test('Get first connected team member: defined', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: create participant
    const participant1 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant1);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant1.participantId);
    // create participant 2
    const participant2 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant2);
    // participant 2 joins
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2.participantId);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).getFirstConnectedTeamMember(Util.team1Name)
    ).toBeDefined();
  });

  test('Get first connected Team member: undefined', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: create participant 1
    const participant1 = factory.createParticipant(Util.getSocket());
    participant1.state = EParticipantState.Disconnected;
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant1);
    // Setup: participant 1 joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant1.participantId);
    // Setup: create participant 2
    const participant2 = factory.createParticipant(Util.getSocket());
    participant2.state = EParticipantState.Disconnected;
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant2);
    // participant 2 joins
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2.participantId);
    const participant2Id = participant2.participantId;
    // participant 2 joins
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2Id);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).getFirstConnectedTeamMember(Util.team1Name)
    ).toBeUndefined();
  });

  test('Get connected Team members', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: create participant 1
    const participant1 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant1);
    // Setup: participant 1 joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant1.participantId);
    // Setup: create participant 2
    const participant2 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant2);
    // participant 2 joins
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2.participantId);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).getConnectedTeamMembers(Util.team1Name).length
    ).toBe(2);
  });

  test('Get Team of participant', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // retrieve
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeamOfParticipant(participant.participantId);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.teamName).toBe(Util.team1Name);
    }
  });

  test('Get Team of participant undefined', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).getTeamOfParticipant(participant.participantId)
    ).toBeUndefined();
  });
});
