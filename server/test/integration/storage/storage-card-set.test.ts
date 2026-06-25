import { describe, expect, test } from '@jest/globals';
import { ECardSetType } from 'shared-lib';
import { IFactoryService, IStorageService } from '../../../src/storage/interfaces';
import STORAGETYPES from '../../../src/storage/storage.types';
import { Util } from './util';

describe('Non customized card sets', () => {
  test('create with Fibonnaci', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Run: retrieve cardset
    const retrieved = container.get<IStorageService>(STORAGETYPES.StorageService).getCardSet(Util.team1Name);
    // Test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(ECardSetType.Fibonacci);
    }
  });

  test('create with Fibonnaci, change to T-Shirt', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet1 = factory.createCardSet(ECardSetType.Fibonacci);
    const cardSet2 = factory.createCardSet(ECardSetType.TShirt);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet1);
    // Run: change the cardset
    container.get<IStorageService>(STORAGETYPES.StorageService).setCardSet(Util.team1Name, cardSet2);
    // Run: retrieve the cardset
    const retrieved = container.get<IStorageService>(STORAGETYPES.StorageService).getCardSet(Util.team1Name);
    // Test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(ECardSetType.TShirt);
    }
  });
});

describe('Customized card set', () => {
  test('Create with customized Fibonacci', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: customize card set
    cardSet.cardSet = ECardSetType.Fibonacci;
    cardSet.cards.splice(7);
    // Run: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Run: retrieve card set
    const retrieved = container.get<IStorageService>(STORAGETYPES.StorageService).getCardSet(Util.team1Name);
    // Test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(ECardSetType.Fibonacci);
      expect(retrieved.cards).toHaveLength(7);
    }
  });

  test('Create with standard Fibonacci, customize it', () => {
    const container = Util.getContainer();
    const factory = container.get<IFactoryService>(STORAGETYPES.FactoryService);
    const cardSet = factory.createCardSet(ECardSetType.Fibonacci);
    // Setup: create team
    const team = factory.createTeam(Util.team1Name);
    container.get<IStorageService>(STORAGETYPES.StorageService).addTeam(team, cardSet);
    // Run: get card set
    const retrieved = container.get<IStorageService>(STORAGETYPES.StorageService).getCardSet(Util.team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      // Run: customize and set customized card set
      retrieved.cardSet = ECardSetType.Fibonacci;
      retrieved.cards.splice(7);
      // Run: retrieve card set
      const retrieved2 = container.get<IStorageService>(STORAGETYPES.StorageService).getCardSet(Util.team1Name);
      // Test
      expect(retrieved2).toBeDefined();
      if (retrieved2) {
        expect(retrieved2.cardSet).toBe(ECardSetType.Fibonacci);
        expect(retrieved2.cards).toHaveLength(7);
      }
    }
  });
});
