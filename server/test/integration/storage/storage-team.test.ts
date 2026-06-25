import { describe, expect, test } from '@jest/globals';
import { ECardSetType, EGameState } from 'shared-lib';
import { IServerParticipant, IServerTeam } from '../../../src/objects';
import { IFactoryService, IStorageService } from '../../../src/storage/interfaces';
import STORAGETYPES from '../../../src/storage/storage.types';
import { Util } from './util';

describe('CRUD', () => {
  test('Create', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // test
    expect(team.gameState).toBe(EGameState.Cleared);
    expect(team.teamName).toBe(Util.team1Name);
  });

  test('Update', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // retrieve and test
    let retrieved = container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      // update
      retrieved.gameState = EGameState.Started;
      // retrieve and test
      retrieved = container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name);
      if (retrieved) {
        expect(retrieved.gameState).toBe(EGameState.Started);
      }
    }
  });

  test('Delete', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // delete team
    container.get<IStorageService>(STORAGETYPES.StorageService).deleteTeam(Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name)).toBeUndefined();
    expect(() => container.get<IStorageService>(STORAGETYPES.StorageService).getCardSet(Util.team1Name)).toThrow(
      'Team has no cardset'
    );
  });

  test('Delete with members', () => {
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
    // delete team
    container.get<IStorageService>(STORAGETYPES.StorageService).deleteTeam(Util.team1Name);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true)
        .length
    ).toBe(0);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name)).toBeUndefined();
  });

  test('Delete with estimations', () => {
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
    // start estimating
    container.get<IStorageService>(STORAGETYPES.StorageService).startEstimating(Util.team1Name);
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // delete team
    container.get<IStorageService>(STORAGETYPES.StorageService).deleteTeam(Util.team1Name);
    // test
    expect(
      container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true)
        .length
    ).toBe(0);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name)).toBeUndefined();
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name).length).toBe(0);
  });
});

describe('Queries', () => {
  test('GetTeam returns team', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // retrieve
    const retrieved = container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.gameState).toBe(EGameState.Cleared);
      expect(retrieved.teamName).toBe(Util.team1Name);
    }
  });

  test('GetTeam returns undefined', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team2Name)).toBeUndefined();
  });

  test('All teams', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet1 = factory.createCardSet(ECardSetType.Fibonacci);
    const cardSet2 = factory.createCardSet(ECardSetType.Cohn);
    // Setup: create team 1
    const team1 = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team1, cardSet1);
    // Setup: create team 2
    const team2 = factory.createTeam(Util.team2Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team2, cardSet2);
    // retrieve
    const allTeams = container.get<IStorageService>(STORAGETYPES.StorageService).allTeams();
    // test
    expect(allTeams).toHaveLength(2);
    expect(allTeams.find((t: IServerTeam) => t.teamName === Util.team1Name)).toBeDefined();
    expect(allTeams.find((t: IServerTeam) => t.teamName === Util.team2Name)).toBeDefined();
  });

  test('Filter teams', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet1 = factory.createCardSet(ECardSetType.Fibonacci);
    const cardSet2 = factory.createCardSet(ECardSetType.Cohn);
    // Setup: create team 1
    const team1 = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team1, cardSet1);
    // Setup: create team 2
    const team2 = factory.createTeam(Util.team2Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team2, cardSet2);
    // filter teams
    const filterTeams = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .filterTeams((t: IServerTeam) => t.teamName === Util.team1Name);
    // test
    expect(filterTeams).toHaveLength(1);
    expect(filterTeams.find((t: IServerTeam) => t.teamName === Util.team1Name)).toBeDefined();
    expect(filterTeams.find((t: IServerTeam) => t.teamName === Util.team2Name)).toBeUndefined();
  });

  test('Team exists: Yes', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).teamExists(Util.team1Name)).toBe(true);
  });

  test('Team exists: No', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).teamExists(Util.team2Name)).toBe(false);
  });
});
