import { describe, expect, test } from '@jest/globals';
import { ECardSetType, EstimationDto } from 'shared-lib';
import type { IFactoryService, IStorageService } from '../../../src/storage/interfaces/index.js';
import STORAGETYPES from '../../../src/storage/storage.types.js';
import { Util } from './util.js';

describe('CRUD', () => {
  test('create (factory method)', () => {
    const container = Util.getContainer();
    const estimation = container.get<IFactoryService>(STORAGETYPES.FactoryService).createEstimation('participant', 0);
    expect(estimation.cardIndex).toBe(0);
    expect(estimation.participantId).toBe('participant');
  });

  test('create (upsert)', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // start estimating
    container.get<IStorageService>(STORAGETYPES.StorageService).startEstimating(Util.team1Name);
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // retrieve estimations
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    // test
    expect(estimations).toHaveLength(1);
    expect(estimations[0].cardIndex).toBe(0);
  });

  test('update (upsert)', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // start estimating
    container.get<IStorageService>(STORAGETYPES.StorageService).startEstimating(Util.team1Name);
    // estimate first time
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // estimate second time
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 1);
    // retrieve estimations
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    expect(estimations).toHaveLength(1);
    // test
    expect(estimations[0].cardIndex).toBe(1);
  });

  test('delete', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // start estimating
    container.get<IStorageService>(STORAGETYPES.StorageService).startEstimating(Util.team1Name);
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // withdraw estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteEstimation(Util.team1Name, participant.participantId);
    // retrieve estimations
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    // test
    expect(estimations).toHaveLength(0);
  });
});

describe('CRUD when estimation has not started', () => {
  test('create', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // estimate
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // retrieve estimations
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    // test
    expect(estimations).toHaveLength(0);
  });

  test('update', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // first estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // second estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 1);
    // retrieve estimations
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    // test
    expect(estimations).toHaveLength(0);
  });

  test('delete', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant
    const participant = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Setup: join team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant.participantId);
    // estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant.participantId, 0);
    // withdraw estimation
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteEstimation(Util.team1Name, participant.participantId);
    // retrieve estimations
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    // test
    expect(estimations).toHaveLength(0);
  });
});

describe('Reveal', () => {
  test('All have estimated', () => {
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
    // start estimating
    container.get<IStorageService>(STORAGETYPES.StorageService).startEstimating(Util.team1Name);
    // estimation of participant 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1.participantId, 1);
    // estimation of participant 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant2.participantId, 2);
    // reveal
    container.get<IStorageService>(STORAGETYPES.StorageService).reveal(Util.team1Name);
    // test
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    const estimation1 = estimations.find((e: EstimationDto) => e.participantId === participant1.participantId);
    expect(estimation1).toBeDefined();
    if (estimation1) {
      expect(estimation1.cardIndex).toBe(1);
    }
    const estimation2 = estimations.find((e: EstimationDto) => e.participantId === participant2.participantId);
    expect(estimation2).toBeDefined();
    if (estimation2) {
      expect(estimation2.cardIndex).toBe(2);
    }
  });

  test('One participant has not estimated', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant 1
    const participant1 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant1);
    // Setup: create participant 2
    const participant2 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant2);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // participant 1 joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant1.participantId);
    // participant 2 joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2.participantId);
    // start estimating
    container.get<IStorageService>(STORAGETYPES.StorageService).startEstimating(Util.team1Name);
    // estimation of participant 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1.participantId, 1);
    // reveal
    container.get<IStorageService>(STORAGETYPES.StorageService).reveal(Util.team1Name);
    // test
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    expect(estimations).toHaveLength(1);
    const estimation1 = estimations.find((e: EstimationDto) => e.participantId === participant1.participantId);
    expect(estimation1).toBeDefined();
    if (estimation1) {
      expect(estimation1.cardIndex).toBe(1);
    }
  });

  test('One participant has withdrawn his estimation', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create participant 1
    const participant1 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant1);
    // Setup: create participant 2
    const participant2 = factory.createParticipant(Util.getSocket());
    container.get<IStorageService>(STORAGETYPES.StorageService).addParticipant(participant2);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // participant 1 joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant1.participantId);
    // participant 2 joins team
    container.get<IStorageService>(STORAGETYPES.StorageService).joinTeam(Util.team1Name, participant2.participantId);
    // start estimating
    container.get<IStorageService>(STORAGETYPES.StorageService).startEstimating(Util.team1Name);
    // estimation of participant 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant1.participantId, 1);
    // estimation of participant 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .upsertEstimation(Util.team1Name, participant2.participantId, 2);
    // withdrawal of participant 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .deleteEstimation(Util.team1Name, participant2.participantId);
    // reveal

    container.get<IStorageService>(STORAGETYPES.StorageService).reveal(Util.team1Name);
    // test
    const estimations = container.get<IStorageService>(STORAGETYPES.StorageService).getEstimations(Util.team1Name);
    expect(estimations).toHaveLength(1);
    const estimation1 = estimations.find((e: EstimationDto) => e.participantId === participant1.participantId);
    expect(estimation1).toBeDefined();
    if (estimation1) {
      expect(estimation1.cardIndex).toBe(1);
    }
  });
});
