import { describe, expect, test } from '@jest/globals';
import { EGameState } from 'shared-lib';
import { FactoryService, TeamRepository } from '../../../src/storage/implementation/index.js';
import type { IFactoryService, ITeamRepository } from '../../../src/storage/interfaces/index.js';

describe('ITeamRepository', () => {
  test('create team', () => {
    const teamName = 'team';
    const factory: IFactoryService = new FactoryService();
    const team = factory.createTeam(teamName);
    expect(team.teamName).toBe(teamName);
  });

  test('set last access time', () => {
    const teamName = 'team';
    const repository: ITeamRepository = new TeamRepository();
    const factory: IFactoryService = new FactoryService();
    const team = factory.createTeam(teamName);
    repository.add(team);
    const lastAccess = team.lastAccessTime;
    repository.add(team);
    repository.setLastAccessTime(teamName);
    const retrieved = repository.get(teamName);
    if (retrieved) {
      expect(retrieved.lastAccessTime > lastAccess);
    }
  });

  test('set status', () => {
    const lastAccess = Date.now();
    const teamName = 'team';
    const repository: ITeamRepository = new TeamRepository();
    const factory: IFactoryService = new FactoryService();
    const team = factory.createTeam(teamName);
    repository.add(team);
    repository.setGameState(teamName, EGameState.Started);
    const retrieved = repository.get(teamName);
    if (retrieved) {
      expect(retrieved.lastAccessTime > lastAccess);
      expect(retrieved.gameState).toBe(EGameState.Started);
    }
  });
});

test('BaseRepository CR-D', () => {
  const teamName = 'team';
  const repository: ITeamRepository = new TeamRepository();
  const factory: IFactoryService = new FactoryService();
  const team = factory.createTeam(teamName);
  repository.add(team);
  expect(repository.get(teamName)).toBeDefined();
  expect(repository.getAll().length).toBe(1);
  expect(repository.exists(teamName)).toBe(true);
  repository.remove(teamName);
  expect(repository.get(teamName)).toBeUndefined();
  expect(repository.getAll().length).toBe(0);
  expect(repository.exists(teamName)).toBe(false);
});
