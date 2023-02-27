import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { ECardSet, EPokerStatus, IEstimation } from "../../../../shared-lib/src";
import { ICardService } from '../../../src/services/interfaces';
import { IStorageService } from "../../../src/storage/interfaces";
import { Util } from './util';

describe('CRUD', () => {
  test('create', () => {
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
    // retrieve estimations
    const estimations = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getEstimations(Util.team1Name);
    // test
    expect(estimations.length).toBe(1);
    expect(estimations[0].cardIndex).toBe(0);
  });

  test('update', () => {
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
    // estimate first time
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 0);
    // estimate second time
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 1);
    // retrieve estimations
    const estimations = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getEstimations(Util.team1Name); expect(estimations.length).toBe(1);
    // test
    expect(estimations[0].cardIndex).toBe(1);
  });

  test('delete', () => {
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
    // withdraw estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteEstimation(Util.team1Name, participant1Id);
    // retrieve estimations
    const estimations = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getEstimations(Util.team1Name);
    // test
    expect(estimations.length).toBe(0);
  });
});

describe('CRUD when estimation has not started', () => {
  test('create', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
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
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 0);
    // retrieve estimations
    const estimations = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getEstimations(Util.team1Name);
    // test
    expect(estimations.length).toBe(0);
  });

  test('update', () => {
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
    // first estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 0);
    // second estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 1);
    // retrieve estimations
    const estimations = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getEstimations(Util.team1Name);
    // test
    expect(estimations.length).toBe(0);
  });

  test('delete', () => {
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
    // estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 0);
    // withdraw estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteEstimation(Util.team1Name, participant1Id);
    // retrieve estimations
    const estimations = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getEstimations(Util.team1Name);
    // test
    expect(estimations.length).toBe(0);
  });
});

describe('Reveal', () => {
  test('All have estimated', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create first participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create second participant
    const participant2Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // first participant joins team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // second participant joins team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant2Id);
    // start estimating
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .startEstimating(Util.team1Name);
    // estimation of participant 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 1);
    // estimation of participant 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant2Id, 2);
    // reveal
    const [status, estimations] = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .reveal(Util.team1Name);
    // test
    expect(status).toBe(EPokerStatus.Revealed);
    expect(estimations.length).toBe(2);
    const estimation1 = estimations.find(((e: IEstimation) => e.participantId === participant1Id));
    expect(estimation1).toBeDefined();
    if (estimation1) {
      expect(estimation1.cardIndex).toBe(1);
      expect(estimation1.revealed).toBe(true);
    }
    const estimation2 = estimations.find(((e: IEstimation) => e.participantId === participant2Id));
    expect(estimation2).toBeDefined();
    if (estimation2) {
      expect(estimation2.cardIndex).toBe(2);
      expect(estimation2.revealed).toBe(true);
    }
  });

  test('One participant has not estimated', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create participant 1
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create participant 2
    const participant2Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // participant 1 joins team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // participant 2 joins team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant2Id);
    // start estimating
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .startEstimating(Util.team1Name);
    // estimation of participant 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1Id, 1);
    // reveal
    const [status, estimations] = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .reveal(Util.team1Name);
    // test
    expect(status).toBe(EPokerStatus.Revealed);
    expect(estimations.length).toBe(2);
    const estimation1 = estimations.find(((e: IEstimation) => e.participantId === participant1Id));
    expect(estimation1).toBeDefined();
    if (estimation1) {
      expect(estimation1.cardIndex).toBe(1);
      expect(estimation1.revealed).toBe(true);
    }
    const estimation2 = estimations.find(((e: IEstimation) => e.participantId === participant2Id));
    expect(estimation2).toBeDefined();
    if (estimation2) {
      expect(estimation2.cardIndex).toBe(cardSet.unknownEstimationIndex);
      expect(estimation2.revealed).toBe(true);
    }
    // retrieve
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getEstimations(Util.team1Name);
    // test retrieved
    expect(retrieved.length).toBe(2);
    const retrieved1 = estimations.find(((e: IEstimation) => e.participantId === participant1Id));
    expect(retrieved1).toBeDefined();
    if (retrieved1) {
      expect(retrieved1.cardIndex).toBe(1);
      expect(retrieved1.revealed).toBe(true);
    }
    const retrieved2 = estimations.find(((e: IEstimation) => e.participantId === participant2Id));
    expect(retrieved2).toBeDefined();
    if (retrieved2) {
      expect(retrieved2.cardIndex).toBe(cardSet.unknownEstimationIndex);
      expect(retrieved2.revealed).toBe(true);
    }
  });
});
