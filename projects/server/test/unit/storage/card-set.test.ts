import { describe, expect, test } from '@jest/globals';

import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { IFactoryService } from '../../../src/storage/interfaces/factory.service';
import { CardSetRepository } from '../../../src/storage/implementation/card-set.repository';
import { ICardSetRepository } from '../../../src/storage/interfaces/card-set.repository';
import { ECardSet, ICard } from '../../../../shared-lib/src';
import { Util } from '../util';

describe('CRUD', () => {

  test('Create', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService();
    const cohn = factory.createCardSet(ECardSet.Cohn);
    repository.setCardSet(Util.team1Name, cohn);
    const retrieved = repository.getCardSet(Util.team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(cohn.cardSet);
      expect(retrieved.cards.length).toBe(cohn.cards.length);
    }
  });

  test('Update', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService();
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    repository.setCardSet(Util.team1Name, cohn);
    repository.setCardSet(Util.team1Name, fibo);
    const retrieved = repository.getCardSet(Util.team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(fibo.cardSet);
      expect(retrieved.cards.length).toBe(fibo.cards.length);
    }
  });

  test('Retrieve unexisting', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    expect(repository.getCardSet(Util.team1Name)).toBeUndefined();
  });


  test('Delete non existing returns false', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    expect(repository.removeCardSet(Util.team1Name)).toBe(false);
  });

  test('Delete', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService();
    const cohn = factory.createCardSet(ECardSet.Cohn);
    repository.setCardSet(Util.team1Name, cohn);

    expect(repository.removeCardSet(Util.team1Name)).toBe(true);
    const retrieved = repository.getCardSet(Util.team1Name);
    expect(retrieved).toBeUndefined();

  });

});

describe('Two teams', () => {
  test('create cardset for two teams', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService();
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    repository.setCardSet(Util.team1Name, cohn);
    repository.setCardSet(Util.team2Name, fibo);
    let retrieved = repository.getCardSet(Util.team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(cohn.cardSet);
      expect(retrieved.cards.length).toBe(cohn.cards.length);
    }
    retrieved = repository.getCardSet(Util.team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(fibo.cardSet);
      expect(retrieved.cards.length).toBe(fibo.cards.length);
    }
  });

  test('update cardset for one team', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService();
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    const tshirt = factory.createCardSet(ECardSet.TShirt);
    repository.setCardSet(Util.team1Name, cohn);
    repository.setCardSet(Util.team2Name, fibo);
    repository.setCardSet(Util.team2Name, tshirt);
    let retrieved = repository.getCardSet(Util.team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(cohn.cardSet);
      expect(retrieved.cards.length).toBe(cohn.cards.length);
    }
    retrieved = repository.getCardSet(Util.team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(tshirt.cardSet);
      expect(retrieved.cards.length).toBe(tshirt.cards.length);
    }
  });

  test('delete cardset for a teams', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService();
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    repository.setCardSet(Util.team1Name, cohn);
    repository.setCardSet(Util.team2Name, fibo);
    expect(repository.removeCardSet(Util.team1Name)).toBe(true);
    expect(repository.removeCardSet(Util.team1Name)).toBe(false);
    let retrieved = repository.getCardSet(Util.team1Name);
    expect(retrieved).toBeUndefined();
    retrieved = repository.getCardSet(Util.team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(fibo.cardSet);
      expect(retrieved.cards.length).toBe(fibo.cards.length);
    }
  });

});

describe('Factory should return valid sets', () => {
  test.each([ECardSet.Cohn, ECardSet.Fibonacci, ECardSet.TShirt])('Card set %p', (set: ECardSet) => {
    const cardSet = new FactoryService().createCardSet(set);
    expect(cardSet.cardSet).toBe(set);
    expect(cardSet.cards.find((card: ICard) => card.isUnknownEstimation)).toBeDefined();
    expect(cardSet.cards.filter((card: ICard) => card.isEstimation).length).toBeGreaterThanOrEqual(2);
  });

})

