import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { ECardSet } from "../../../../shared-lib/src";
import { IServerParticipant } from "../../../src/objects";
import { ICardService } from '../../../src/services/interfaces';
import { IStorageService } from "../../../src/storage/interfaces";
import { Util } from './util';

describe('CRUD', () => {
  test('Create', () => {
    const container = Util.getContainer();
    // create participant
    const participant1 = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket());
    const participant1Id = participant1.participantId;
    // test
    expect(participant1).toBeDefined();
    expect(participant1.nick).toBe(Util.participant1Nick);
    expect(participant1.participantId).not.toBeNull();
    expect(participant1.participantId.length).toBeGreaterThan(0);
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
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // retrieve and set new nick
    const newNick = 'Johan';
    let retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getParticipant(participant1Id);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      retrieved.nick = newNick;
    }
    // retrieve
    retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getParticipant(participant1Id);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      retrieved.nick = newNick;
    }
  });

  test('Delete', () => {
    const container = Util.getContainer();
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant1Id, undefined);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getParticipant(participant1Id)).toBeUndefined();
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).participantExists(participant1Id)).toBe(false);
  });

  test('delete after joining a team', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create team
    container.
      get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant1Id, Util.team1Name);
    // retrieve and test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name).length).toBe(0);
  });

  test('delete after estimating', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
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
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant1Id, Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name).length).toBe(0);
  });

  test('delete after estimating without starting estimations', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
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
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 0);
    // delete participant
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant1Id, Util.team1Name);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name).length).toBe(0);
  });
});

describe('join and leave team', () => {
  test('join team', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
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
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name).length).toBe(1);
  });

  test('leave team', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
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
    // leave team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .leaveTeam(Util.team1Name, participant1Id);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeamMembers(Util.team1Name).length).toBe(0);
  });
});

describe('queries', () => {
  test('Filter participants', () => {
    const container = Util.getContainer();
    // create participant 1
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create participant 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket());
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true).length).toBe(2);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((p: IServerParticipant) => p.nick === Util.participant1Nick).length).toBe(1);
    // delete participant 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteParticipant(participant1Id, undefined);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((_p: IServerParticipant) => true).length).toBe(1);
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).filterParticipants((p: IServerParticipant) => p.nick === Util.participant1Nick).length).toBe(0);
  });
});