import { describe, expect, test } from '@jest/globals';
import { CardDto, ECardSetType } from 'shared-lib';
import { CardSetRepository, FactoryService } from '../../../src/storage/implementation/index.js';
import type { ICardSetRepository, IFactoryService } from '../../../src/storage/interfaces/index.js';
import { Util } from '../util.js';

describe('CRUD', () => {
  test('Create', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService();
    const cohn = factory.createCardSet(ECardSetType.Cohn);
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
    const cohn = factory.createCardSet(ECardSetType.Cohn);
    const fibo = factory.createCardSet(ECardSetType.Fibonacci);
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
    const cohn = factory.createCardSet(ECardSetType.Cohn);
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
    const cohn = factory.createCardSet(ECardSetType.Cohn);
    const fibo = factory.createCardSet(ECardSetType.Fibonacci);
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
    const cohn = factory.createCardSet(ECardSetType.Cohn);
    const fibo = factory.createCardSet(ECardSetType.Fibonacci);
    const tshirt = factory.createCardSet(ECardSetType.TShirt);
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
    const cohn = factory.createCardSet(ECardSetType.Cohn);
    const fibo = factory.createCardSet(ECardSetType.Fibonacci);
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
  test.each([ECardSetType.Cohn, ECardSetType.Fibonacci, ECardSetType.TShirt])('Card set %p', (set: ECardSetType) => {
    const cardSet = new FactoryService().createCardSet(set);
    expect(cardSet.cardSet).toBe(set);
    expect(cardSet.cards.find((card: CardDto) => card.isUnknownEstimation)).toBeDefined();
    expect(cardSet.cards.filter((card: CardDto) => card.isEstimation).length).toBeGreaterThanOrEqual(2);
  });
});
