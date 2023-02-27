import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { IServerParticipant } from 'objects';
import { ECardSet } from "../../../../shared-lib/src";
import { ICardService } from '../../../src/services/interfaces';
import { IStorageService } from "../../../src/storage/interfaces";
import { Util } from './util';

/**
 * All tests should contain a sleep to avoid false alerts
 */
describe('Last access time updated', () => {
  test('after participant joins', async () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create team
    const team = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    const lastAccessTime = team.lastAccessTime;
    await Util.sleep(10);
    // join team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // retrieve
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved).toBeGreaterThan(lastAccessTime);
    }
  });

  test('after participant leaves', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // leave team
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .leaveTeam(Util.team1Name, participant1Id);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBeGreaterThan(lastAccessTime);
      }
    }
  });

  test('after giving an estimation', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // estimate
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .upsertEstimation(Util.team1Name, participant1Id, 0);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBeGreaterThan(lastAccessTime);
      }
    }
  });

  test('after deleting an estimation', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // withdraw estimation
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .deleteEstimation(Util.team1Name, participant1Id);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBeGreaterThan(lastAccessTime);
      }
    }
  });

  test('after starting estimations', async () => {
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
    // retrieve
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // start estimating
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .startEstimating(Util.team1Name);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBeGreaterThan(lastAccessTime);
      }
    }
  });

  test('after revealing', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // reveal
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .reveal(Util.team1Name);
      // retrieve and test
      expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name)?.lastAccessTime)
        .toBeGreaterThan(lastAccessTime);
    }
  });

  test('after changing the cardset', async () => {
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
    // retrieve
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // change card set
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .setCardSet(Util.team1Name, cardSet);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBeGreaterThan(lastAccessTime);
      }
    }
  });

  test('after deleting a team member', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // delete participant
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .deleteParticipant(participant1Id, Util.team1Name);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBeGreaterThan(lastAccessTime);
      }
    }
  });
});

describe('Last access time NOT updated', () => {
  test('after retrieving the estimations', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // get estimations
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getEstimations(Util.team1Name);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBe(lastAccessTime);
      }

    }
  });

  test('after filtering the participants', async () => {
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
    // retrieve
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService).getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // filter participants
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .filterParticipants((_p: IServerParticipant) => true);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBe(lastAccessTime);
      }
    }
  });

  test('after getting the team members', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // get team members
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeamMembers(Util.team1Name);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBe(lastAccessTime);
      }
    }
  });

  test('after getting the first connected team member', async () => {
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
    const lastAccessTime = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeam(Util.team1Name)?.lastAccessTime;
    if (lastAccessTime) {
      await Util.sleep(10);
      // get first connected participant
      container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getFirstConnectedTeamMember(Util.team1Name);
      // retrieve
      const retrieved = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getTeam(Util.team1Name)?.lastAccessTime;
      // test
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved).toBe(lastAccessTime);
      }
    }
  });
});
