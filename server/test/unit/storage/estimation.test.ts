import { describe, expect, test } from '@jest/globals';

import { IEstimation } from '../../../../shared-lib/src';
import { EstimationRepository } from '../../../src/storage/implementation/estimation.repository';
import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { IEstimationRepository } from '../../../src/storage/interfaces/estimation.repository';
import { IFactoryService } from '../../../src/storage/interfaces/factory.service';

describe('start- estimate - delete - restart', () => {
  const participantId1 = 'participant1';
  const cardIndex1 = 1;
  const cardIndex2 = 2;
  const teamName = 'team';

  test('create estimation with value', () => {
    const participantId1 = 'participant';
    const cardIndex1 = 1;
    const factory: IFactoryService = new FactoryService();
    const estimation = factory.createEstimation(participantId1, cardIndex1);
    expect(estimation.cardIndex).toBe(cardIndex1);
    expect(estimation.participantId).toBe(participantId1);
  });

  test('create estimation without value', () => {
    const participantId1 = 'participant';
    const factory: IFactoryService = new FactoryService();
    const estimation = factory.createEstimation(participantId1, undefined);
    expect(estimation.cardIndex).toBeUndefined();
    expect(estimation.participantId).toBe(participantId1);
  });

  test('upsert before start', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    const estimation = repository.upsertEstimation(teamName, participantId1, cardIndex1);
    expect(estimation.cardIndex).toBe(cardIndex1);
    expect(estimation.participantId).toBe(participantId1);
    expect(repository.getEstimations(teamName).length).toBe(0);
  });

  test('upsert', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName);
    const estimation = repository.upsertEstimation(teamName, participantId1, cardIndex1);
    expect(estimation.cardIndex).toBe(cardIndex1);
    expect(estimation.participantId).toBe(participantId1);
    const estimations = repository.getEstimations(teamName);
    expect(estimations.length).toBe(1);
    expect(estimations[0].cardIndex).toBe(cardIndex1);
    expect(estimations[0].participantId).toBe(participantId1);
  });

  test('delete', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName);
    repository.upsertEstimation(teamName, participantId1, cardIndex1);
    const estimation = repository.deleteEstimation(teamName, participantId1);
    expect(estimation.cardIndex).toBeUndefined();
    const estimations = repository.getEstimations(teamName);
    expect(estimations.length).toBe(0);
  });

  test('start - upsert - restart', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName);
    repository.upsertEstimation(teamName, participantId1, cardIndex1);
    repository.startEstimating(teamName);
    const estimations = repository.getEstimations(teamName);
    expect(estimations.length).toBe(0);
  });

  test('upsert - upsert', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName);
    repository.upsertEstimation(teamName, participantId1, cardIndex1);
    repository.upsertEstimation(teamName, participantId1, cardIndex2);
    const estimations = repository.getEstimations(teamName);
    expect(estimations.length).toBe(1);
    expect(estimations[0].cardIndex).toBe(cardIndex2);
    expect(estimations[0].participantId).toBe(participantId1);
  });
});

describe('multiple participants', () => {
  const participantId1 = 'participant1';
  const cardIndex1 = 1;
  const participantId2 = 'participant2';
  const cardIndex2 = 2;
  const teamName1 = 'team1';
  const cardIndex3 = 3;

  test('upsert two', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName1);
    repository.upsertEstimation(teamName1, participantId1, cardIndex1);
    repository.upsertEstimation(teamName1, participantId2, cardIndex2);
    const estimations = repository.getEstimations(teamName1);
    expect(estimations.length).toBe(2);
    expect(
      estimations.find((e: IEstimation) => e.participantId === participantId1 && e.cardIndex === cardIndex1)
    ).toBeDefined();
    expect(
      estimations.find((e: IEstimation) => e.participantId === participantId2 && e.cardIndex === cardIndex2)
    ).toBeDefined();
  });

  test('upsert two - change one', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName1);
    repository.upsertEstimation(teamName1, participantId1, cardIndex1);
    repository.upsertEstimation(teamName1, participantId2, cardIndex2);
    repository.upsertEstimation(teamName1, participantId2, cardIndex3);
    const estimations = repository.getEstimations(teamName1);
    expect(estimations.length).toBe(2);
    expect(
      estimations.find((e: IEstimation) => e.participantId === participantId1 && e.cardIndex === cardIndex1)
    ).toBeDefined();
    expect(
      estimations.find((e: IEstimation) => e.participantId === participantId2 && e.cardIndex === cardIndex3)
    ).toBeDefined();
  });

  test('upsert two - delete one', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName1);
    repository.upsertEstimation(teamName1, participantId1, cardIndex1);
    repository.upsertEstimation(teamName1, participantId2, cardIndex2);
    repository.deleteEstimation(teamName1, participantId2);
    const estimations = repository.getEstimations(teamName1);
    expect(estimations.length).toBe(1);
    expect(
      estimations.find((e: IEstimation) => e.participantId === participantId1 && e.cardIndex === cardIndex1)
    ).toBeDefined();
    expect(estimations.find((e: IEstimation) => e.participantId === participantId2)).toBeUndefined();
  });
});

describe('remove', () => {
  const participantId1 = 'participant1';
  const cardIndex1 = 1;
  const participantId2 = 'participant2';
  const cardIndex2 = 2;

  const teamName1 = 'team1';
  const teamName2 = 'team2';

  test('remove participant', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName1);
    repository.upsertEstimation(teamName1, participantId1, cardIndex1);
    repository.upsertEstimation(teamName1, participantId2, cardIndex2);
    repository.startEstimating(teamName2);
    repository.upsertEstimation(teamName2, participantId1, cardIndex1);
    repository.upsertEstimation(teamName2, participantId2, cardIndex2);
    repository.removeParticipant(teamName1, participantId1);
    const estimations = repository.getEstimations(teamName1);
    expect(estimations.length).toBe(1);
    expect(
      estimations.find((e: IEstimation) => e.participantId === participantId2 && e.cardIndex === cardIndex2)
    ).toBeDefined();
    expect(estimations.find((e: IEstimation) => e.participantId === participantId1)).toBeUndefined();
    expect(estimations[0].cardIndex).toBe(cardIndex2);
    expect(estimations[0].participantId).toBe(participantId2);
    expect(repository.getEstimations(teamName2).length).toBe(2);
  });

  test('remove team', () => {
    const repository: IEstimationRepository = new EstimationRepository();
    repository.startEstimating(teamName1);
    repository.upsertEstimation(teamName1, participantId1, cardIndex1);
    repository.upsertEstimation(teamName1, participantId2, cardIndex2);
    repository.startEstimating(teamName2);
    repository.upsertEstimation(teamName2, participantId1, cardIndex1);
    repository.upsertEstimation(teamName2, participantId2, cardIndex2);
    repository.removeTeam(teamName1);
    expect(repository.getEstimations(teamName1).length).toBe(0);
    expect(repository.getEstimations(teamName2).length).toBe(2);
  });
});
