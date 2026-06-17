import { describe, expect, test } from '@jest/globals';

import STORAGETYPES from '../../../src/storage/storage.types';

import { ECardSet } from "../../../../shared-lib/src";
import { IServerParticipant } from "../../../src/objects";
import { IFactoryService, IStorageService } from "../../../src/storage/interfaces";
import { Util } from './util';

describe('CRUD', () => {
  test('Create', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    const participant1Id = participant.participantId;
    // test
    expect(participant).toBeDefined();
    expect(participant.nick).toBe(Util.participant1Nick);
    expect(participant.participantId).not.toBeNull();
    expect(participant.participantId.length).toBeGreaterThan(0);
    // retrieve
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getParticipant(participant1Id);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.nick).toBe(Util.participant1Nick);
      expect(retrieved.participantId).toBe(participant1Id);
      expect(retrieved.participantId.length).toBeGreaterThan(0);
    }
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).participantExists(participant1Id)).toBe(true);
  });

  test('Update', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    // retrieve and set new nick
    const newNick = 'Johan';
    let retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getParticipant(participant.participantId);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      retrieved.nick = newNick;
    }
    // retrieve
    retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getParticipant(participant.participantId);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      retrieved.nick = newNick;
    }
  });

  test('Delete', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant.participantId, undefined);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getParticipant(participant.participantId)).toBeUndefined();
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).participantExists(participant.participantId)).toBe(false);
  });

  test('delete after joining a team', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSet.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addTeam(team, cardSet);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    // join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant.participantId);
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant.participantId, Util.team1Name);
    // retrieve and test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name)).toHaveLength(0);
  });

  test('delete after estimating', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSet.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addTeam(team, cardSet);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    // Setup: join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant.participantId);
    // start estimating
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .startEstimating(Util.team1Name);
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant.participantId, Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name)).toHaveLength(0);
  });

  test('delete after estimating without starting estimations', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSet.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addTeam(team, cardSet);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    // Setup: join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant.participantId);
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant.participantId, Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name)).toHaveLength(0);
  });
});

describe('join and leave team', () => {
  test('join team', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSet.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addTeam(team, cardSet);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    // Setup: join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant.participantId);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name)).toHaveLength(1);
  });

  test('leave team', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSet.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addTeam(team, cardSet);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant);
    // Setup: join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant.participantId);
    // leave team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .leaveTeam(Util.team1Name, participant.participantId);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name)).toHaveLength(0);
  });
});

describe('queries', () => {
  test('Filter participants', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    // Setup: create participant
    const participant1 = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant1);
    // Setup: create participant 2
    const participant2 = factory.createParticipant(Util.getSocket());
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .addParticipant(participant2);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true))
      .toHaveLength(2);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((p: IServerParticipant) => p.nick === Util.participant1Nick))
      .toHaveLength(1);
    // delete participant 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant1.participantId, undefined);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true))
      .toHaveLength(1);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((p: IServerParticipant) => p.nick === Util.participant1Nick))
      .toHaveLength(0);
  });
});