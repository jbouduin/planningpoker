import { describe, expect, test } from '@jest/globals';

import { EPokerStatus } from '../../../../shared-lib/src';
import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { TeamRepository } from '../../../src/storage/implementation/team.repository';
import { IFactoryService } from '../../../src/storage/interfaces/factory.service';
import { ITeamRepository } from '../../../src/storage/interfaces/team.repository';

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
    repository.setStatus(teamName, EPokerStatus.Started);
    const retrieved = repository.get(teamName);
    if (retrieved) {
      expect(retrieved.lastAccessTime > lastAccess);
      expect(retrieved.status).toBe(EPokerStatus.Started);
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
