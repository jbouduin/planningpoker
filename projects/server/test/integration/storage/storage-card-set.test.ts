import { describe, expect, test } from '@jest/globals';
import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { ECardSet } from "../../../../shared-lib/src";
import { ICardService } from '../../../src/services/interfaces';
import { IStorageService } from "../../../src/storage/interfaces";
import { Util } from './util';

// TODO 2366 implement backend validations when creating a customized set
describe('Non customized card sets', () => {
  test('create with Fibonnaci', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // retrieve cardset
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getCardSet(Util.team1Name);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(ECardSet.Fibonacci);
    }
  });

  test('create with Fibonnaci, change to T-Shirt', () => {
    const container = Util.getContainer();
    const cardSet1 = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    const cardSet2 = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.TShirt);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet1);
    // change the cardset
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .setCardSet(Util.team1Name, cardSet2);
    // retrieve the cardset
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getCardSet(Util.team1Name);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(ECardSet.TShirt);
    }
  });
});

describe('Customized card set', () => {
  test('Create with customized Fibonacci', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // customize card set
    cardSet.cardSet = ECardSet.Fibonacci;
    cardSet.cards.splice(7);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // retrieve card set
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getCardSet(Util.team1Name);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(ECardSet.Fibonacci);
      expect(retrieved.cards.length).toBe(7);
    }
  });

  test('Create with standard Fibonacci, customize it', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // get card set
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getCardSet(Util.team1Name);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      // customize and set customized card set
      retrieved.cardSet = ECardSet.Fibonacci;
      retrieved.cards.splice(7);
      // retrieve card set
      const retrieved2 = container
        .get<IStorageService>(STORAGETYPES.StorageService)
        .getCardSet(Util.team1Name);
      // test
      expect(retrieved2).toBeDefined();
      if (retrieved2) {
        expect(retrieved2.cardSet).toBe(ECardSet.Fibonacci);
        expect(retrieved2.cards.length).toBe(7);
      }
    }
  });
});