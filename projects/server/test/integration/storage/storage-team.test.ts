import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { ECardSet, EPokerStatus } from "../../../../shared-lib/src";
import { IServerParticipant, ITeam } from "../../../src/objects";
import { ICardService } from '../../../src/services/interfaces';
import { IStorageService } from "../../../src/storage/interfaces";
import { Util } from './util';

describe('CRUD', () => {
  test('Create', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    const team = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // test
    expect(team.status).toBe(EPokerStatus.Cleared);
    expect(team.teamName).toBe(Util.team1Name);
  });

  test('Update', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // retrieve and test
    let retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      // update
      retrieved.status = EPokerStatus.Started;
      // retrieve and test
      retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name);
      if (retrieved) {
        expect(retrieved.status).toBe(EPokerStatus.Started);
      }
    }
  });

  test('Delete', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // delete team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteTeam(Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name))
      .toBeUndefined();
    expect(() => container.get<IStorageService>(STORAGETYPES.StorageService).getCardSet(Util.team1Name))
      .toThrow('Team has no cardset');
  });

  test('Delete with members', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // delete team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteTeam(Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true).length)
      .toBe(0);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name))
      .toBeUndefined();
  });

  test('Delete with estimations', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // start estimating
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .startEstimating(Util.team1Name);
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 0);
    // delete team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteTeam(Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true).length)
      .toBe(0);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name))
      .toBeUndefined();
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name).length)
      .toBe(0);
  });
});

describe('Queries', () => {
  test('GetTeam returns team', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // retrieve
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.status).toBe(EPokerStatus.Cleared);
      expect(retrieved.teamName).toBe(Util.team1Name);
    }
  });

  test('GetTeam returns undefined', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team2Name))
      .toBeUndefined();
  });

  test('All teams', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create team 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team2Name, cardSet);
    // retrieve
    const allTeams = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .allTeams();
    // test
    expect(allTeams.length).toBe(2);
    expect(allTeams.find((t: ITeam) => t.teamName === Util.team1Name)).toBeDefined();
    expect(allTeams.find((t: ITeam) => t.teamName === Util.team2Name)).toBeDefined();
  });

  test('Filter teams', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create team 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team2Name, cardSet);
    // filter teams
    const filterTeams = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .filterTeams((t: ITeam) => t.teamName === Util.team1Name);
    // test
    expect(filterTeams.length).toBe(1);
    expect(filterTeams.find((t: ITeam) => t.teamName === Util.team1Name)).toBeDefined();
    expect(filterTeams.find((t: ITeam) => t.teamName === Util.team2Name)).toBeUndefined();
  });

  test('Team exists: Yes', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).teamExists(Util.team1Name))
      .toBe(true);
  });

  test('Team exists: No', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).teamExists(Util.team2Name))
      .toBe(false);
  });
});